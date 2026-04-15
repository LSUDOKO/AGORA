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
    name: "Portfolio Tracker",
    description: "Tracks the agent wallet, balances, and payment token exposure across testnet flows.",
    priceUSDC: 300_000,
  },
  {
    name: "Market Sentiment Analyzer",
    description: "Combines price action, volume, and risk metadata into a tradeability score.",
    priceUSDC: 400_000,
  },
  {
    name: "Liquidity Monitor",
    description: "Tracks pool depth and estimated APY shifts across the current opportunity set.",
    priceUSDC: 250_000,
  },
] as const;

async function main() {
  // Set network from environment variable
  const targetNetwork = process.env.HARDHAT_NETWORK || "xlayer_testnet";
  if (hre.network.name !== targetNetwork) {
    console.log(`Switching to network: ${targetNetwork}`);
    hre.changeNetwork(targetNetwork);
  }

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
