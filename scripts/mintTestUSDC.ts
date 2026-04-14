import hre from "hardhat";
import deploymentData from "../deployments/addresses.json";

async function main() {
  // Set network from environment variable
  const targetNetwork = process.env.HARDHAT_NETWORK || "xlayer_testnet";
  if (hre.network.name !== targetNetwork) {
    console.log(`Switching to network: ${targetNetwork}`);
    hre.changeNetwork(targetNetwork);
  }

  const [deployer] = await hre.ethers.getSigners();
  const testUsdcAddress = deploymentData.testTokens.TestUSDC;

  if (!testUsdcAddress) {
    throw new Error("Missing TestUSDC address in deployments/addresses.json");
  }

  const TestUSDC = await hre.ethers.getContractFactory("TestUSDC");
  const testUsdc = TestUSDC.attach(testUsdcAddress);

  console.log(`Minting TestUSDC for wallet ${deployer.address}`);
  console.log(`TestUSDC: ${testUsdcAddress}`);

  const amount = 10_000_000_000n; // 10,000 USDC (6 decimals)
  const tx = await testUsdc.mint(deployer.address, amount);
  const receipt = await tx.wait();
  console.log(`Minted ${amount / 1_000_000n} tUSDC in tx ${receipt?.hash}`);

  const balance = await testUsdc.balanceOf(deployer.address);
  console.log(`New balance: ${balance / 1_000_000n} tUSDC`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
