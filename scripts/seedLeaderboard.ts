import hre from "hardhat";
import fs from "fs";
import path from "path";

const deploymentData = JSON.parse(fs.readFileSync(path.join(process.cwd(), "deployments", "addresses.json"), "utf8"));

const DUMMY_AGENTS = [
  { name: "Sentinel Yield", activity: 3 },
  { name: "Market Oracle", activity: 2 },
  { name: "Risk Hunter", activity: 4 },
  { name: "Pulse Scout", activity: 1 },
  { name: "Nexus Flow", activity: 5 },
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log(`Seeding leaderboard on ${network} using deployer ${deployer.address}`);

  const agentRegistryAddr = deploymentData.contracts.AgentRegistry;
  const paymentRouterAddr = deploymentData.contracts.x402PaymentRouter;
  const testUsdcAddr = deploymentData.testTokens.TestUSDC;
  const skillsRegistryAddr = deploymentData.contracts.SkillsRegistry;

  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = AgentRegistry.attach(agentRegistryAddr);

  const PaymentRouter = await hre.ethers.getContractFactory("x402PaymentRouter");
  const paymentRouter = PaymentRouter.attach(paymentRouterAddr);

  const TestUSDC = await hre.ethers.getContractFactory("TestUSDC");
  const testUsdc = TestUSDC.attach(testUsdcAddr);

  const SkillsRegistry = await hre.ethers.getContractFactory("SkillsRegistry");
  const skillsRegistry = SkillsRegistry.attach(skillsRegistryAddr);

  // Get available skills
  const skillCount = await skillsRegistry.skillCount();
  if (Number(skillCount) === 0) {
    console.log("No skills found. Please run seedSkills.ts first.");
    return;
  }
  
  const skillId = 1n; 

  for (const dummy of DUMMY_AGENTS) {
    console.log(`\nConfiguring ${dummy.name}...`);
    
    try {
      // 1. Create temporary wallet
      const wallet = hre.ethers.Wallet.createRandom().connect(hre.ethers.provider);
      console.log(`Generated wallet: ${wallet.address}`);

      // 2. Fund with gas (0.01 OKB)
      const fundTx = await deployer.sendTransaction({
        to: wallet.address,
        value: hre.ethers.parseEther("0.01")
      });
      await fundTx.wait();
      console.log(`Funded with gas.`);
      await sleep(1000);

      // 3. Mint USDC (1000 USDC)
      const mintTx = await testUsdc.mint(wallet.address, 1000_000_000n);
      await mintTx.wait();
      console.log(`Minted 1000 tUSDC.`);
      await sleep(1000);

      // 4. Register Agent
      const registerTx = await (agentRegistry as any).connect(wallet).registerAgent(dummy.name);
      const registerReceipt = await registerTx.wait();
      
      // Get agentId from ownerToAgentId to be sure
      let agentId = await (agentRegistry as any).ownerToAgentId(wallet.address);
      if (agentId === 0n) {
          console.log("Registry indexing delay... waiting 2s");
          await sleep(2000);
          agentId = await (agentRegistry as any).ownerToAgentId(wallet.address);
      }
      
      console.log(`Registered Agent ID: ${agentId}`);
      if (agentId === 0n) throw new Error("Failed to get agentId after registration");

      // 5. Approve Router
      const approveTx = await (testUsdc as any).connect(wallet).approve(paymentRouterAddr, hre.ethers.MaxUint256);
      await approveTx.wait();
      console.log(`Approved PaymentRouter.`);
      await sleep(1000);

      // 6. Perform Activity
      console.log(`Performing ${dummy.activity} transactions...`);
      for (let i = 0; i < dummy.activity; i++) {
         try {
           const hireTx = await (paymentRouter as any).connect(wallet).hireSkill(agentId, skillId, { gasLimit: 500000 });
           await hireTx.wait();
           console.log(`  - Tx ${i+1} complete`);
           await sleep(1000);
         } catch (err: any) {
           console.error(`  - Tx ${i+1} failed: ${err.message}`);
         }
      }
    } catch (err: any) {
      console.error(`Failed to configure ${dummy.name}: ${err.message}`);
    }
  }

  console.log("\nLeaderboard seeding complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
