import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("factory:createPair", "Create pair")
  .addParam(
    "factoryContractAddress",
    "UniswapV2Factory contract address",
    process.env.FACTORY_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "aTokenContractAddress",
    "ERC20 contract address",
    process.env.ERC20_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "bTokenContractAddress",
    "ERC20 contract address",
    process.env.ERC20_CONTRACT_ADDRESS2,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const {
      factoryContractAddress,
      aTokenContractAddress,
      bTokenContractAddress,
    } = args;

    const UniswapV2Factory = await hre.ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const uniswapV2Factory = await UniswapV2Factory.attach(
      factoryContractAddress
    );

    await uniswapV2Factory.createPair(
      aTokenContractAddress,
      bTokenContractAddress
    );

    const uniswapV2PairAddress = await uniswapV2Factory.getPair(
      aTokenContractAddress,
      bTokenContractAddress
    );

    console.log("UniswapV2Pair deployed to:", uniswapV2PairAddress);
    console.log("Current pair count:", await uniswapV2Factory.allPairsLength());
  });
