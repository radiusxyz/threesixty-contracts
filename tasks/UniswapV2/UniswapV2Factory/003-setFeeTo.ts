import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("setFeeTo", "")
  .addParam(
    "factoryContractAddress",
    "UniswapV2Factory contract address",
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

    const UniswapV2Factory = await hre.ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const uniswapV2Factory = await UniswapV2Factory.attach(
      factoryContractAddress
    );

    await uniswapV2Factory.setFeeTo(feeToAddress);

    console.log(`feeTo is ${await uniswapV2Factory.feeTo()}`);
  });
