import { config as loadEnv } from "dotenv";
import deploymentData from "../deployments/addresses.json";
import { AgentOrchestrator } from "./multiAgent";
import { analyzeGas } from "./skills/gasOptimizer";
import { monitorLiquidity } from "./skills/liquidityMonitor";
import { analyzeMarketSentiment } from "./skills/marketSentiment";
import { trackPortfolio } from "./skills/portfolioTracker";
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
import { xlayerTestnet } from "../frontend/lib/chain";
import { TESTNET_CHAIN_ID, resolvePaymentToken, resolveRpcUrl, resolveTestnetSwapTokenIn } from "../lib/agentConfig";
import { UniswapExecutionService } from "../lib/uniswapExecution";

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

function isConfiguredAddress(value: string | undefined): value is `0x${string}` {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

export class PrimeAgent {
  public agentId: bigint | null = null;
  private readonly chain = xlayerTestnet;
  private readonly rpcUrl = resolveRpcUrl();
  private readonly account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
  private readonly publicClient = createPublicClient({ chain: this.chain, transport: http(this.rpcUrl) });
  private readonly walletClient = createWalletClient({ account: this.account, chain: this.chain, transport: http(this.rpcUrl) });
  private readonly uniswapExecution = new UniswapExecutionService();
  private readonly addresses = {
    agentRegistry: deploymentData.contracts.AgentRegistry as `0x${string}`,
    paymentRouter: deploymentData.contracts.x402PaymentRouter as `0x${string}`,
    usdc: deploymentData.usdc as `0x${string}`,
  };

  constructor() {
    if (!process.env.PRIVATE_KEY) {
      throw new Error("PRIVATE_KEY is required to run PrimeAgent");
    }
    if (Number(process.env.NEXT_PUBLIC_CHAIN_ID || deploymentData.chainId || TESTNET_CHAIN_ID) !== TESTNET_CHAIN_ID) {
      throw new Error(`PrimeAgent only supports X Layer testnet (${TESTNET_CHAIN_ID}) in this build.`);
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
    const [gas, liquidity, portfolio] = await Promise.all([
      analyzeGas(this.rpcUrl),
      monitorLiquidity(this.rpcUrl),
      trackPortfolio(this.rpcUrl, this.account.address, [resolvePaymentToken()]),
    ]);
    const sentiment = await analyzeMarketSentiment(resolveTestnetSwapTokenIn());
    console.log(`Gas: ${gas.gasPriceGwei} gwei (${gas.executionBand})`);
    console.log(`Liquidity: ${liquidity.summary}`);
    console.log(`Portfolio: $${portfolio.totalUsd.toFixed(2)} across ${portfolio.tokens.length} tokens`);
    console.log(`Sentiment: ${sentiment.label} (${sentiment.score})`);

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
    console.log("This build is locked to testnet-only execution.");
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

      // Check if a separate provider wallet is configured
      if (!process.env.PROVIDER_PRIVATE_KEY) {
        console.warn("PROVIDER_PRIVATE_KEY not set. Running risk audit directly (no x402 payment).");
        const auditResult = await auditPool(opportunity.poolAddress, this.rpcUrl);
        console.log(`Risk Audit complete: score=${auditResult.score} passed=${auditResult.passed}`);
        return auditResult;
      }

      // Derive provider address and check for self-hire
      const providerAccount = privateKeyToAccount(process.env.PROVIDER_PRIVATE_KEY as `0x${string}`);
      if (providerAccount.address.toLowerCase() === this.account.address.toLowerCase()) {
        console.warn("PROVIDER_PRIVATE_KEY resolves to the same address as the agent owner. Self-hire detected — falling back to direct audit (no payment).");
        const auditResult = await auditPool(opportunity.poolAddress, this.rpcUrl);
        console.log(`Risk Audit complete: score=${auditResult.score} passed=${auditResult.passed}`);
        return auditResult;
      }

      // Real x402 payment flow
      const agentId = this.agentId ?? (await this.ensureAgentId());
      console.log(`Executing x402 payment flow: agent=${this.account.address} provider=${providerAccount.address}`);

      // Step 1: Approve USDC spending
      const approveHash = await this.walletClient.writeContract({
        address: this.addresses.usdc,
        abi: erc20Abi,
        functionName: "approve",
        args: [this.addresses.paymentRouter, RISK_AUDITOR_PRICE],
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: approveHash });
      console.log(`USDC approved for payment router: ${approveHash}`);

      // Step 2: Hire the skill — get receipt count before to derive receipt ID
      const receiptCountBefore = await this.publicClient.readContract({
        address: this.addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "receiptCount",
      });

      const hireHash = await this.walletClient.writeContract({
        address: this.addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "hireSkill",
        args: [agentId, RISK_AUDITOR_SKILL_ID],
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: hireHash });
      const receiptId = receiptCountBefore + 1n;
      console.log(`Skill hired via x402. receiptId=${receiptId} tx=${hireHash}`);

      // Step 3: Run the audit
      const auditResult = await auditPool(opportunity.poolAddress, this.rpcUrl);
      console.log(`Risk Audit complete: score=${auditResult.score} passed=${auditResult.passed}`);

      // Step 4: Mark the receipt as completed
      const completeHash = await this.walletClient.writeContract({
        address: this.addresses.paymentRouter,
        abi: paymentRouterAbi,
        functionName: "markCompleted",
        args: [receiptId],
        account: this.account,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: completeHash });
      console.log(`Receipt ${receiptId} marked completed: ${completeHash}`);

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

      const prepared = await this.uniswapExecution.prepareSwap();
      console.log(`Step 1: Quote received. Amount out=${prepared.quoteAmountOut} minOut=${prepared.minAmountOut}`);
      console.log(`Step 2: Prepared swap target ${prepared.swapTarget}`);

      if (!this.uniswapExecution.getEnvironment().execute) {
        console.log("UNISWAP_EXECUTE is false. Skipping broadcast and treating this cycle as a dry-run.");
        return;
      }

      const receipt = await this.uniswapExecution.executePreparedSwap(prepared);
      console.log(`Swap confirmed! tx=${receipt.transactionHash}`);

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
          `PrimeAgent execution bookkeeping complete. Wallet balance=${formatUnits(balance, 6)} ${this.chain.id === 1952 ? 'tUSDC' : 'USDC'}`,
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
  if (process.env.MULTI_AGENT === "true") {
    const rpcUrl = resolveRpcUrl();
    console.log("MULTI_AGENT=true: starting AgentOrchestrator...");
    const orchestrator = new AgentOrchestrator();
    orchestrator.start(rpcUrl).catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  } else {
    const agent = new PrimeAgent();
    agent.run().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  }
}
