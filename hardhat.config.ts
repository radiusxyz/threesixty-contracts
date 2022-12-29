import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      }    
    ],
    overrides: {},
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    optimism_kovan: {
      url: process.env.OPTIMISM_KOVAN_URL || "",
      accounts: [
        process.env.PRIV_KEY0 as any,
        process.env.PRIV_KEY1 as any,
        process.env.PRIV_KEY2 as any,
      ],
      gas: 10000000,
    },
    matic_mumbai: {
      url: process.env.MUMBAI_URL || "",
      accounts: [
        process.env.PRIV_KEY0 as any,
        process.env.PRIV_KEY1 as any,
        process.env.PRIV_KEY2 as any,
      ],
      gas: 10000000,
    },
    DEV: {
      url: process.env.DEV_URL || "",
      accounts: [
        process.env.PRIV_KEY0 as any,
        process.env.PRIV_KEY1 as any,
        process.env.PRIV_KEY2 as any,
      ],
      gas: 10000000,
    },
  },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

export default config;
