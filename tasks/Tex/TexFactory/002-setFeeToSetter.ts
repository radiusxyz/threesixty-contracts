import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("setFeeToSetter", "")
  .addParam(
    "factoryContractAddress",
    "TexFactory contract address",
    "0xFD6F7A6a5c21A3f503EBaE7a473639974379c351",
    types.string
  )
  .addParam(
    "feeToSetterAddress",
    "fee to setter address",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    types.string
  )
  .setAction(async (args, hre: any) => {
    const { factoryContractAddress, feeToSetterAddress } = args;

    const TexFactory = await hre.ethers.getContractFactory("TexFactory");
    const fswapFactory = await TexFactory.attach(factoryContractAddress);

    await fswapFactory.setFeeToSetter(feeToSetterAddress);

    console.log(`feeToSetter is ${await fswapFactory.feeToSetter()}`);
  });
