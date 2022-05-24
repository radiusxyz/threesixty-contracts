import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("deploy")
  .addOptionalParam(
    "feeToSetterAddress",
    "Fee to setter address",
    "0x2578F573c28B53c088C928e5722FD944e2279EC6", // l2MessengerAddress
    types.string
  )
  .setAction(async (args, hre: any, runSuper) => {
    hre.deployConfig = args;
    return runSuper(args);
  });

// import { task } from "hardhat/config";
// import * as types from "hardhat/internal/core/params/argumentTypes";

// import { BigNumber } from "@ethersproject/bignumber";

// task("deploy", "")
//   .addOptionalParam("tokenName", "Token name", "FToken", types.string)
//   .addOptionalParam("tokenSymbol", "Token symbol", "FT", types.string)
//   .addOptionalParam("totalSupply", "Total token supply", 1000, types.int)
//   .setAction(async (args, hre: any, runSuper) => {
//     const { totalSupply } = args;

//     args.totalSupply = BigNumber.from(totalSupply).mul(
//       BigNumber.from(10).pow(18)
//     );

//     hre.deployConfig = args;
//     return runSuper(args);
//   });
