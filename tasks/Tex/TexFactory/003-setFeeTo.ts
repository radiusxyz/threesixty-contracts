import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("setFeeTo", "")
  .addParam(
    "factoryContractAddress",
    "TexFactory contract address",
    "0xFD6F7A6a5c21A3f503EBaE7a473639974379c351",
    types.string
  )
  .addParam(
    "feeToAddress",
    "fee to address",
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    types.string
  )
  .setAction(async (args, hre: any) => {
    const { factoryContractAddress, feeToAddress } = args;

    const TexFactory = await hre.ethers.getContractFactory("TexFactory");
    const fswapFactory = await TexFactory.attach(factoryContractAddress);

    await fswapFactory.setFeeTo(feeToAddress);

    console.log(`feeTo is ${await fswapFactory.feeTo()}`);
  });
