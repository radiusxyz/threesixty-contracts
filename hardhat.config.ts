import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@eth-optimism/plugins/hardhat/compiler";

import "hardhat-deploy";
import "./tasks/deploy";
import "./tasks/test";

import "./tasks/Tex/ERC20/001-approve";
import "./tasks/Tex/ERC20/002-transfer";
import "./tasks/Tex/ERC20/003-transferFrom";
import "./tasks/Tex/ERC20/004-permit";

import "./tasks/Tex/TexFactory/001-createPair";
import "./tasks/Tex/TexFactory/002-setFeeToSetter";
import "./tasks/Tex/TexFactory/003-setFeeTo";

import "./tasks/Tex/TexPair/001-mint";
import "./tasks/Tex/TexPair/002-get_reserves";
import "./tasks/Tex/TexPair/003-swap";
import "./tasks/Tex/TexPair/004-burn";
import "./tasks/Tex/TexPair/005-skim";
import "./tasks/Tex/TexPair/006-sync";

import "./tasks/Tex/TexRouter02/001-addLiquidity";
import "./tasks/Tex/TexRouter02/002-addLiquidityETH";
import "./tasks/Tex/TexRouter02/003-removeLiquidity";
import "./tasks/Tex/TexRouter02/004-record";
import "./tasks/Tex/TexRouter02/005-swapExactTokensForTokens";
import "./tasks/Tex/TexRouter02/006-recorderState";
import "./tasks/Tex/TexRouter02/007-approve";
import "./tasks/Tex/TexRouter02/999-temp_1";
import "./tasks/Tex/TexRouter02/999-temp_2";
import "./tasks/Tex/TexRouter02/999-temp_3";

import "./tasks/WETH9/001-deposit";
import "./tasks/WETH9/002-withdraw";
import "./tasks/WETH9/003-approve";
import "./tasks/WETH9/004-transfer";
import "./tasks/WETH9/005-transferFrom";

import "./tasks/utils/accounts";
import "./tasks/utils/001-getInitHash";

import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

import "hardhat-gas-reporter";
import "solidity-coverage";

// Check "https://hardhat.org/config/"
const config: HardhatUserConfig = {
  ovm: {
    solcVersion: "0.5.16",
  },
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
    ],
    overrides: {},
  },
  paths: {
    deploy: "./deploy",
    deployments: "./deployments",
  },
  networks: {
    tex_l1: {
      url: process.env.TEX_L1_URL || "",
      accounts: [
        process.env.PRIVATE_KEY as any,
        process.env.PRIVATE_KEY2 as any,
      ],
    },
    tex_l2: {
      url: process.env.TEX_L2_URL || "",
      accounts: [
        process.env.PRIVATE_KEY as any,
        process.env.PRIVATE_KEY2 as any,
      ],
      gas: 10000000,
    },
    matic: {
      url: process.env.MUMBAI_URL || "",
      accounts: [
        process.env.PRIVATE_KEY as any,
        process.env.PRIVATE_KEY2 as any,
        process.env.PRIVATE_KEY3 as any,
        process.env.PRIVATE_KEY4 as any,
        process.env.PRIVATE_KEY5 as any,
        process.env.PRIVATE_KEY6 as any,
        process.env.PRIVATE_KEY7 as any,
        // process.env.PRIVATE_KEY8 as any,
        // process.env.PRIVATE_KEY9 as any,
        // process.env.PRIVATE_KEY10 as any,
      ],
      gas: 10000000,
    },
  },
};

export default config;
