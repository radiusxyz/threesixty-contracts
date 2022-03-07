import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "@ethersproject/bignumber";

task("mint", "Mint")
  .addParam(
    "pairContractAddress",
    "Token pair contract address",
    "0x29de890c941CDbbcF626D44Efd3b2C2BEF35Bb44",
    types.string
  )
  .setAction(async (args, hre: any) => {
    const [from, to] = await hre.ethers.getSigners();
    const fromAddress = from.address;
    const toAddress = to.address;
    const { pairContractAddress, amount } = args;

    const UniswapV2Pair = await hre.ethers.getContractFactory("UniswapV2Pair");
    const uniswapV2Pair = await UniswapV2Pair.attach(pairContractAddress);

    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const aTokenContract = await ERC20.attach(await uniswapV2Pair.token0());
    const bTokenContract = await ERC20.attach(await uniswapV2Pair.token1());

    console.log("aTokenContractAddress: ", aTokenContract.address);
    console.log("bTokenContractAddress: ", bTokenContract.address);
    console.log("");

    console.log("Before mint------------------------------------------------");
    console.log("totalSupply: ", await uniswapV2Pair.totalSupply());
    console.log("balance: ", await uniswapV2Pair.balanceOf(fromAddress));
    console.log(
      "aToken balance: ",
      await aTokenContract.balanceOf(uniswapV2Pair.address)
    );
    console.log(
      "bToken balance: ",
      await bTokenContract.balanceOf(uniswapV2Pair.address)
    );
    let reserves = await uniswapV2Pair.getReserves();
    console.log("aToken reserve: ", reserves[0]);
    console.log("bToken reserve: ", reserves[1]);
    console.log("------------------------------------------------------------");

    await aTokenContract.transfer(
      uniswapV2Pair.address,
      BigNumber.from(1).mul(BigNumber.from(10).pow(18))
    );
    await bTokenContract.transfer(
      uniswapV2Pair.address,
      BigNumber.from(4).mul(BigNumber.from(10).pow(18))
    );
    const result = await uniswapV2Pair.mint(fromAddress, { gasLimit: 9999999 });

    console.log("After mint--------------------------------------------------");
    console.log("totalSupply: ", await uniswapV2Pair.totalSupply());
    console.log("balance: ", await uniswapV2Pair.balanceOf(fromAddress));
    console.log(
      "aToken balance: ",
      await aTokenContract.balanceOf(uniswapV2Pair.address)
    );
    console.log(
      "bToken balance: ",
      await bTokenContract.balanceOf(uniswapV2Pair.address)
    );
    reserves = await uniswapV2Pair.getReserves();
    console.log("aToken reserve: ", reserves[0]);
    console.log("bToken reserve: ", reserves[1]);
    console.log("------------------------------------------------------------");
  });
