import hre from "hardhat";
import deploymentData from "../deployments/addresses.json";

const SKILLS = [
  {
    name: "Yield Finder",
    description: "Scans X Layer Uniswap pools for the best yield opportunities.",
    priceUSDC: 200_000,
  },
  {
    name: "Risk Auditor",
    description: "Evaluates pool risk, liquidity depth, and concentration before execution.",
    priceUSDC: 500_000,
  },
  {
    name: "Gas Optimizer",
    description: "Optimizes execution timing and gas strategy for Prime Agents.",
    priceUSDC: 100_000,
  },
  {
    name: "Onchain Analyst",
    description: "Analyzes on-chain wallet and protocol signals for decision support.",
    priceUSDC: 300_000,
  },
  {
    name: "Arb Scanner",
    description: "Scans cross-pool inefficiencies and arbitrage windows on X Layer.",
    priceUSDC: 400_000,
  },
  {
    name: "Liquidation Watch",
    description: "Monitors liquidation risk and profitable liquidation opportunities.",
    priceUSDC: 250_000,
  },
] as const;

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const skillsRegistryAddress = deploymentData.contracts.SkillsRegistry;

  if (!skillsRegistryAddress) {
    throw new Error("Missing SkillsRegistry address in deployments/addresses.json");
  }

  const SkillsRegistry = await hre.ethers.getContractFactory("SkillsRegistry");
  const skillsRegistry = SkillsRegistry.attach(skillsRegistryAddress);

  console.log(`Seeding skills using deployer ${deployer.address}`);
  console.log(`SkillsRegistry: ${skillsRegistryAddress}`);

  for (const skill of SKILLS) {
    const tx = await skillsRegistry.registerSkill(skill.name, skill.description, skill.priceUSDC);
    const receipt = await tx.wait();
    console.log(`Registered ${skill.name} (${skill.priceUSDC} base units) in tx ${receipt?.hash}`);
  }

  const skillCount = await skillsRegistry.skillCount();
  console.log(`Done. Total skills registered: ${skillCount}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
