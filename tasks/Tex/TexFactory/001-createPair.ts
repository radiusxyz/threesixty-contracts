import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("factory:createPair", "Create pair")
  .addParam(
    "factoryContractAddress",
    "TexFactory contract address",
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

    const TexFactory = await hre.ethers.getContractFactory("TexFactory");
    const fswapFactory = await TexFactory.attach(factoryContractAddress);

    console.log(`A Token Contract ${aTokenContractAddress}`);
    console.log(`B Token Contract ${bTokenContractAddress}`);
    await fswapFactory.createPair(aTokenContractAddress, bTokenContractAddress);

    const fswapPairAddress = await fswapFactory.getPair(
      aTokenContractAddress,
      bTokenContractAddress
    );

    console.log("TexPair deployed to:", fswapPairAddress);
    console.log("Current pair count:", await fswapFactory.allPairsLength());
  });
