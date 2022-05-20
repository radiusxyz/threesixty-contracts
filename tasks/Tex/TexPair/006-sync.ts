import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("sync", "Sync")
  .addParam(
    "pairContractAddress",
    "Token pair contract address",
    "0x29de890c941CDbbcF626D44Efd3b2C2BEF35Bb44",
    types.string
  )
  .setAction(async (args, hre: any) => {
    const [from] = await hre.ethers.getSigners();
    const fromAddress = from.address;
    const { pairContractAddress } = args;

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const fswapPair = await TexPair.attach(pairContractAddress);

    await fswapPair.sync();
  });
