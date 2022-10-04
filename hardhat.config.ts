import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.5.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.6.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },      
    ],
    overrides: {},
  },
  paths: {
    deploy: "./deploy",
    deployments: "./deployments",
  },
  networks: {
    optimism_kovan: {
      url: process.env.OPTIMISM_KOVAN_URL || "",
      accounts: [
        process.env.PRIV_KEY0 as any,
        process.env.PRIV_KEY1 as any,
        process.env.PRIV_KEY2 as any,
        // process.env.PRIVATE_KEY3 as any,
        // process.env.PRIVATE_KEY4 as any,
        // process.env.PRIVATE_KEY5 as any,
        // process.env.PRIVATE_KEY6 as any,
        // process.env.PRIVATE_KEY7 as any,
        // process.env.PRIVATE_KEY8 as any,
        // process.env.PRIVATE_KEY9 as any,
        // process.env.PRIVATE_KEY10 as any,
      ],
      gas: 10000000,
    },
    matic_mumbai: {
      url: process.env.MUMBAI_URL || "",
      accounts: [
        process.env.PRIV_KEY0 as any,
        process.env.PRIV_KEY1 as any,
        process.env.PRIV_KEY2 as any,
        // process.env.PRIVATE_KEY3 as any,
        // process.env.PRIVATE_KEY4 as any,
        // process.env.PRIVATE_KEY5 as any,
        // process.env.PRIVATE_KEY6 as any,
        // process.env.PRIVATE_KEY7 as any,
        // process.env.PRIVATE_KEY8 as any,
        // process.env.PRIVATE_KEY9 as any,
        // process.env.PRIVATE_KEY10 as any,
      ],
      gas: 10000000,
    },
    DEV: {
      url: process.env.DEV_URL || "",
      accounts: [
        process.env.PRIV_KEY0 as any,
        process.env.PRIV_KEY1 as any,
        process.env.PRIV_KEY2 as any,
        // process.env.PRIVATE_KEY3 as any,
        // process.env.PRIVATE_KEY4 as any,
        // process.env.PRIVATE_KEY5 as any,
        // process.env.PRIVATE_KEY6 as any,
        // process.env.PRIVATE_KEY7 as any,
        // process.env.PRIVATE_KEY8 as any,
        // process.env.PRIVATE_KEY9 as any,
        // process.env.PRIVATE_KEY10 as any,
      ],
      gas: 10000000,
    },
  },
};

export default config;
