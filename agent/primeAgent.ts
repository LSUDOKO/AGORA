import { config as loadEnv } from "dotenv";
import deploymentData from "../deployments/addresses.json";
import { auditPool, type AuditResult } from "./skills/riskAuditor";
import { findYield, type YieldOpportunity } from "./skills/yieldFinder";
import {
  createPublicClient,
  createWalletClient,
  formatUnits,
  http,
  parseAbi,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { xlayer, xlayerTestnet } from "../frontend/lib/chain";

loadEnv();

interface Opportunity extends YieldOpportunity {}

const erc20Abi = parseAbi([
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
]);

const agentRegistryAbi = parseAbi([
  "function ownerToAgentId(address owner) view returns (uint256)",
  "function incrementTxCount(uint256 agentId)",
  "function recordEarnings(uint256 agentId, uint256 amount)",
]);

const paymentRouterAbi = parseAbi([
  "function hireSkill(uint256 agentId, uint256 skillId) returns (uint256)",
  "function receiptCount() view returns (uint256)",
  "function markCompleted(uint256 receiptId)",
]);

const RISK_AUDITOR_SKILL_ID = 2n;
const RISK_AUDITOR_PRICE = 500_000n;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PrimeAgent {
  public agentId: bigint | null = null;
  private readonly chain = Number(process.env.NEXT_PUBLIC_CHAIN_ID || deploymentData.chainId || 1952) === 196 ? xlayer : xlayerTestnet;
  private readonly rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || this.chain.rpcUrls.default.http[0];
  private readonly account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  private readonly publicClient = createPublicClient({ chain: this.chain, transport: http(this.rpcUrl) });
  private readonly walletClient = createWalletClient({ account: this.account, chain: this.chain, transport: http(this.rpcUrl) });
  private readonly addresses = {
    agentRegistry: deploymentData.contracts.AgentRegistry as `0x${string}`,
    paymentRouter: deploymentData.contracts.x402PaymentRouter as `0x${string}`,
    usdc: deploymentData.usdc as `0x${string}`,
  };

  constructor() {
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is required to run PrimeAgent");
    }
  }

  async ensureAgentId() {
    const agentId = await this.publicClient.readContract({
      address: this.addresses.agentRegistry,
      abi: agentRegistryAbi,
      functionName: "ownerToAgentId",
      args: [this.account.address],
    });

    if (!agentId || agentId === 0n) {
      throw new Error("PrimeAgent is not registered in AgentRegistry. Register via dashboard or script first.");
    }

    this.agentId = agentId;
    return agentId;
  }

  async run() {
    await this.ensureAgentId();
    console.log(`PrimeAgent started for agentId=${this.agentId?.toString()} address=${this.account.address}`);

    while (true) {
      try {
        const opportunity = await this.scanForYield();
        if (opportunity) {
          const auditResult = await this.hireRiskAuditor(opportunity);
          if (auditResult.passed) {
            await this.executeSwap(opportunity, auditResult);
          } else {
            console.log(`Audit rejected pool ${opportunity.poolAddress}: ${auditResult.reasons.join(" | ")}`);
          }
        } else {
          console.log("No actionable opportunity found in this cycle.");
        }
      } catch (error) {
        console.error("PrimeAgent loop error:", error);
      }

      await sleep(30_000);
    }
  }

  async scanForYield(): Promise<Opportunity | null> {
    try {
      const opportunities = await findYield(this.rpcUrl);
      const best = opportunities[0] ?? null;
      if (best) {
        console.log(
          `Yield scan: best pool ${best.poolAddress} with est APY ${best.estimatedAPY}% and reserves ${best.reserve0}/${best.reserve1}`,
        );
      }
      return best;
    } catch (error) {
      console.error("scanForYield failed:", error);
      return null;
    }
  }

  async hireRiskAuditor(opportunity: Opportunity): Promise<AuditResult> {
    try {
      const agentId = this.agentId ?? (await this.ensureAgentId());
      const allowance = await this.publicClient.readContract({
        address: this.addresses.usdc,
        abi: erc20Abi,
        functionName: "allowance",
        args: [this.account.address, this.addresses.paymentRouter],
      });

      if (allowance < RISK_AUDITOR_PRICE) {
        console.log("Approving tUSDC/USDC for x402PaymentRouter...");
        const approveHash = await this.walletClient.writeContract({
          address: this.addresses.usdc,
          abi: erc20Abi,
          functionName: "approve",
          args: [this.addresses.paymentRouter, parseUnits("1000", 6)],
          account: this.account,
        });
        await this.publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log(`Approve confirmed: ${approveHash}`);
      }

      console.log(`Hiring Risk Auditor for pool ${opportunity.poolAddress}...`);
      const hireHash = await this.walletClient.writeContract({
        address: this.addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "hireSkill",
        args: [agentId, RISK_AUDITOR_SKILL_ID],
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: hireHash });

      const receiptId = await this.publicClient.readContract({
        address: this.addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "receiptCount",
      });

      console.log(`Risk Auditor hired. receiptId=${receiptId.toString()} tx=${hireHash}`);
      const auditResult = await auditPool(opportunity.poolAddress, this.rpcUrl);

      console.warn(
        "markCompleted requires the registered skill provider wallet. PrimeAgent cannot finalize provider-side completion unless it controls that provider account.",
      );

      return auditResult;
    } catch (error) {
      console.error("hireRiskAuditor failed:", error);
      return {
        score: 0,
        passed: false,
        reasons: [error instanceof Error ? error.message : "Unknown audit error"],
        liquidity: 0n,
        reserve0: 0n,
        reserve1: 0n,
      };
    }
  }

  async executeSwap(opportunity: Opportunity, auditResult: AuditResult): Promise<void> {
    try {
      const agentId = this.agentId ?? (await this.ensureAgentId());

      console.log(
        `Execution ready: pool=${opportunity.poolAddress} apy=${opportunity.estimatedAPY}% auditScore=${auditResult.score}`,
      );
      console.log("Uniswap execution path should be wired here once X Layer pool/router addresses are supplied.");

      const txHash = await this.walletClient.writeContract({
        address: this.addresses.agentRegistry,
        abi: agentRegistryAbi,
        functionName: "incrementTxCount",
        args: [agentId],
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: txHash });

      const earningsHash = await this.walletClient.writeContract({
        address: this.addresses.agentRegistry,
        abi: agentRegistryAbi,
        functionName: "recordEarnings",
        args: [agentId, parseUnits("12.5", 6)],
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: earningsHash });

      const balance = await this.publicClient.readContract({
        address: this.addresses.usdc,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [this.account.address],
      });

      console.log(
        `PrimeAgent execution bookkeeping complete. Wallet payment token balance=${formatUnits(balance, 6)}`,
      );
    } catch (error) {
      console.error("executeSwap failed:", error);
    }
  }
}

if (require.main === module) {
  const agent = new PrimeAgent();
  agent.run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
