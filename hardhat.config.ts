import dotenv from "dotenv";
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
import "./tasks/Tex/TexRouter02/006-recorderState";
import "./tasks/Tex/TexRouter02/007-approve";

// import "./tasks/Hackathon/001-tex_verify";
// import "./tasks/Hackathon/002-tex_decrypt";
// import "./tasks/Hackathon/003-tex_add_tx_ids";
// import "./tasks/Hackathon/004-tex_check_order";
// import "./tasks/Hackathon/005-tex_swap";

// import "./tasks/Hackathon/999-temp_1";
// import "./tasks/Hackathon/999-temp_2";
// import "./tasks/Hackathon/999-temp_3";
// import "./tasks/Hackathon/999-tex_encrypt";

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
        // process.env.OPERATOR_PRIVATE_KEY as any,
        process.env.PRIVATE_KEY1 as any,
        process.env.PRIVATE_KEY2 as any,
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
      url: process.env.MATIC_MUMBAI_URL || "",
      accounts: [
        // process.env.OPERATOR_PRIVATE_KEY as any,
        process.env.PRIVATE_KEY1 as any,
        process.env.PRIVATE_KEY2 as any,
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
