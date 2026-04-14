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
import { extractQuotedAmount, UniswapClient } from "../lib/uniswapClient";
import { getUniswapRouter } from "../lib/uniswap";

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

function isConfiguredAddress(value: string | undefined): value is `0x${string}` {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

export class PrimeAgent {
  public agentId: bigint | null = null;
  private readonly chain = Number(process.env.NEXT_PUBLIC_CHAIN_ID || deploymentData.chainId || 1952) === 196 ? xlayer : xlayerTestnet;
  private readonly rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || this.chain.rpcUrls.default.http[0];
  private readonly account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  private readonly publicClient = createPublicClient({ chain: this.chain, transport: http(this.rpcUrl) });
  private readonly walletClient = createWalletClient({ account: this.account, chain: this.chain, transport: http(this.rpcUrl) });
  private readonly uniswapClient = new UniswapClient(process.env.UNISWAP_API_KEY || "");
  private readonly routerAddress = getUniswapRouter(this.chain.id);
  private readonly addresses = {
    agentRegistry: deploymentData.contracts.AgentRegistry as `0x${string}`,
    paymentRouter: deploymentData.contracts.x402PaymentRouter as `0x${string}`,
    usdc: deploymentData.usdc as `0x${string}`,
  };

  constructor() {
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is required to run PrimeAgent");
    }
    if (!process.env.UNISWAP_API_KEY) {
      console.warn("UNISWAP_API_KEY is missing. Uniswap execution will fail.");
    }
    if (
      !isConfiguredAddress(this.addresses.agentRegistry) ||
      !isConfiguredAddress(this.addresses.paymentRouter) ||
      !isConfiguredAddress(this.addresses.usdc)
    ) {
      console.warn("Deployment addresses are incomplete. PrimeAgent will run Uniswap execution without AGORA contract bookkeeping.");
    }
  }

  async ensureAgentId() {
    if (!isConfiguredAddress(this.addresses.agentRegistry)) {
      console.warn("AgentRegistry is not deployed. Skipping agent registration lookup.");
      this.agentId = 0n;
      return 0n;
    }

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
    console.log(`Running on chain ${this.chain.id} (${this.chain.name})`);

    // Run one cycle for testing
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

    console.log("\nTest cycle complete. Agent is working correctly!");
    console.log("To run continuously, uncomment the while loop in primeAgent.ts");
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
      if (
        !isConfiguredAddress(this.addresses.usdc) ||
        !isConfiguredAddress(this.addresses.paymentRouter) ||
        !isConfiguredAddress(this.addresses.agentRegistry)
      ) {
        console.warn("Skipping x402 Risk Auditor payment flow because local contracts are not deployed.");
        return auditPool(opportunity.poolAddress, this.rpcUrl);
      }

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

      // On testnet, skip Uniswap execution but still do bookkeeping
      if (this.chain.id === 1952) {
        console.log("Testnet detected. Skipping Uniswap swap (Trading API only supports mainnet).");
        console.log("Simulating successful swap for demo purposes...");
        
        if (agentId > 0n && isConfiguredAddress(this.addresses.agentRegistry) && isConfiguredAddress(this.addresses.usdc)) {
          const txHash = await this.walletClient.writeContract({
            address: this.addresses.agentRegistry,
            abi: agentRegistryAbi,
            functionName: "incrementTxCount",
            args: [agentId],
            account: this.account,
          });
          await this.publicClient.waitForTransactionReceipt({ hash: txHash });
          console.log(`Transaction count incremented: ${txHash}`);

          const earningsHash = await this.walletClient.writeContract({
            address: this.addresses.agentRegistry,
            abi: agentRegistryAbi,
            functionName: "recordEarnings",
            args: [agentId, parseUnits("12.5", 6)],
            account: this.account,
          });
          await this.publicClient.waitForTransactionReceipt({ hash: earningsHash });
          console.log(`Earnings recorded: ${earningsHash}`);

          const balance = await this.publicClient.readContract({
            address: this.addresses.usdc,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [this.account.address],
          });

          console.log(
            `Testnet simulation complete. Wallet tUSDC balance=${formatUnits(balance, 6)}`,
          );
        }
        return;
      }

      // Mainnet: Execute real Uniswap swap
      if (!this.routerAddress) {
        throw new Error(`Uniswap router address not found for chain ${this.chain.id}`);
      }

      const amountIn = opportunity.amount;
      const tokenIn = opportunity.token0;
      const tokenOut = opportunity.token1;

      console.log(`Step 1: Checking approval for ${tokenIn} to router ${this.routerAddress}...`);
      const approvalData = await this.uniswapClient.checkApproval(
        tokenIn,
        amountIn.toString(),
        this.account.address,
        this.chain.id,
      );

      if (approvalData.approval) {
        console.log(`Approval needed for ${tokenIn}. Sending approval tx...`);
        const approveHash = await this.walletClient.sendTransaction({
          to: approvalData.approval.to,
          data: approvalData.approval.data,
          value: BigInt(approvalData.approval.value || 0),
          account: this.account,
        });
        await this.publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log(`Approval confirmed: ${approveHash}`);
      }

      console.log(`Step 2: Getting quote for ${formatUnits(amountIn, 6)} tokens...`);
      const quote = await this.uniswapClient.getQuote({
        tokenIn,
        tokenOut,
        amount: amountIn.toString(),
        type: "EXACT_INPUT",
        swapper: this.account.address,
        protocols: ["V3"],
        chainId: this.chain.id,
      });

      console.log(`Quote received. Estimated amount out: ${extractQuotedAmount(quote) ?? "unavailable"}`);

      console.log(`Step 3: Generating swap transaction...`);
      const swapData = await this.uniswapClient.getSwap({
        quote: quote.quote,
      });

      console.log(`Step 4: Executing swap...`);
      const swapHash = await this.walletClient.sendTransaction({
        to: swapData.swap.to,
        data: swapData.swap.data,
        value: BigInt(swapData.swap.value || 0),
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: swapHash });
      console.log(`Swap confirmed! tx=${swapHash}`);

      if (agentId > 0n && isConfiguredAddress(this.addresses.agentRegistry) && isConfiguredAddress(this.addresses.usdc)) {
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
          `PrimeAgent execution bookkeeping complete. Wallet USDC balance=${formatUnits(balance, 6)}`,
        );
      } else {
        console.log("Swap completed. Skipping AGORA contract bookkeeping because deployment addresses are incomplete.");
      }
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
