import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "@ethersproject/bignumber";

task("getReserves", "Get reserves")
  .addParam(
    "pairContractAddress",
    "Token pair contract address",
    process.env.TOKEN_PAIR_CONTRACT_ADDRESS,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const { pairContractAddress } = args;

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const fswapPair = await TexPair.attach(pairContractAddress);

    const ERC20 = await hre.ethers.getContractFactory("WETH9");
    const aTokenContract = await ERC20.attach(await fswapPair.token0());
    const bTokenContract = await ERC20.attach(await fswapPair.token1());

    const aTokenName = await aTokenContract.name();
    const aTokenSymbol = await aTokenContract.symbol();
    const aTokenAddress = aTokenContract.address;

    const bTokenName = await bTokenContract.name();
    const bTokenSymbol = await bTokenContract.symbol();
    const bTokenAddress = bTokenContract.address;

    console.log(`${aTokenName}(${aTokenSymbol}): ${aTokenAddress}`);
    console.log(`${bTokenName}(${bTokenSymbol}): ${bTokenAddress}`);
    console.log("");

    const reserves = await fswapPair.getReserves();
    console.log("aToken reserve: ", reserves[0]);
    console.log("bToken reserve: ", reserves[1]);
  });
