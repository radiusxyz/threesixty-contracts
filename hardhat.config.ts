import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@eth-optimism/plugins/hardhat/compiler";

import "hardhat-deploy";
import "./tasks/deploy";
import "./tasks/test";

import "./tasks/UniswapV2/ERC20/001-approve";
import "./tasks/UniswapV2/ERC20/002-transfer";
import "./tasks/UniswapV2/ERC20/003-transferFrom";
import "./tasks/UniswapV2/ERC20/004-permit";

import "./tasks/UniswapV2/UniswapV2Factory/001-createPair";
import "./tasks/UniswapV2/UniswapV2Factory/002-setFeeToSetter";
import "./tasks/UniswapV2/UniswapV2Factory/003-setFeeTo";

import "./tasks/UniswapV2/UniswapV2Pair/001-mint";
import "./tasks/UniswapV2/UniswapV2Pair/002-get_reserves";
import "./tasks/UniswapV2/UniswapV2Pair/003-swap";
import "./tasks/UniswapV2/UniswapV2Pair/004-burn";
import "./tasks/UniswapV2/UniswapV2Pair/005-skim";
import "./tasks/UniswapV2/UniswapV2Pair/006-sync";

import "./tasks/UniswapV2/UniswapV2Router02/001-addLiquidity";
import "./tasks/UniswapV2/UniswapV2Router02/002-addLiquidityETH";
import "./tasks/UniswapV2/UniswapV2Router02/003-removeLiquidity";
import "./tasks/UniswapV2/UniswapV2Router02/004-swapExactTokensForTokens";

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
  },
};

export default config;
