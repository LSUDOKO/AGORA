import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "@okxweb3/hardhat-explorer-verify";
import * as dotenv from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const privateKey = process.env.PRIVATE_KEY;
const accounts = privateKey ? [privateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    xlayer_testnet: {
      url: "https://testrpc.xlayer.tech/terigon",
      chainId: 1952,
      accounts,
    },
    xlayer_mainnet: {
      url: "https://rpc.xlayer.tech",
      chainId: 196,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      xlayer_testnet: process.env.OKLINK_API_KEY || "",
      xlayer_mainnet: process.env.OKLINK_API_KEY || "",
    },
    customChains: [
      {
        network: "xlayer_testnet",
        chainId: 1952,
        urls: {
          apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER_TESTNET",
          browserURL: "https://www.oklink.com/xlayer-test",
        },
      },
      {
        network: "xlayer_mainnet",
        chainId: 196,
        urls: {
          apiURL: "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER",
          browserURL: "https://www.oklink.com/xlayer",
        },
      },
    ],
  },
  okxweb3explorer: {
    apiKey: process.env.OKLINK_API_KEY || "",
  },
};

export default config;
