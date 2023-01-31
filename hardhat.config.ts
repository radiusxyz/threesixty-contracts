import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import "./tasks/accounts";
import "./tasks/setMiddleToken";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
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
    mumbai: {
      url: process.env.MUMBAI_URL || "",
      accounts: [
        process.env.PRIV_KEY0 as any,
        process.env.PRIV_KEY1 as any,
        process.env.PRIV_KEY2 as any,
      ],
      gas: 10000000,
    },
    polygon: {
      url: process.env.POLYGON_URL || "",
      accounts: [
        process.env.PRIV_R1 as any,
        process.env.PRIV_R2 as any,
        process.env.PRIV_R3 as any,
      ],
      gas: 10000000,
    }
  },
};

export default config;
