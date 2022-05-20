import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "@ethersproject/bignumber";

task("swap", "Swap")
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

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const fswapPair = await TexPair.attach(pairContractAddress);

    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const aTokenContract = await ERC20.attach(await fswapPair.token0());
    const bTokenContract = await ERC20.attach(await fswapPair.token1());

    console.log("aTokenContractAddress: ", aTokenContract.address);
    console.log("bTokenContractAddress: ", bTokenContract.address);
    console.log("");

    console.log("Before swap------------------------------------------------");
    console.log("totalSupply: ", await fswapPair.totalSupply());
    console.log("balance: ", await fswapPair.balanceOf(fromAddress));
    console.log(
      "aToken balance: ",
      await aTokenContract.balanceOf(fswapPair.address)
    );
    console.log(
      "bToken balance: ",
      await bTokenContract.balanceOf(fswapPair.address)
    );
    let reserves = await fswapPair.getReserves();
    console.log("aToken reserve: ", reserves[0]);
    console.log("bToken reserve: ", reserves[1]);
    console.log("------------------------------------------------------------");

    const aTokenInAmount = BigNumber.from(1).mul(BigNumber.from(10).pow(18));
    const aTokenOutAmount = BigNumber.from(0).mul(BigNumber.from(10).pow(18));
    const bTokenOutAmount = BigNumber.from(4).mul(BigNumber.from(10).pow(18));
    await aTokenContract.transfer(fswapPair.address, aTokenInAmount);
    const result = await fswapPair.swap(
      aTokenOutAmount,
      bTokenOutAmount,
      fromAddress,
      "0x",
      { gasLimit: 9999999 }
    );

    console.log("After swap--------------------------------------------------");
    console.log("totalSupply: ", await fswapPair.totalSupply());
    console.log("balance: ", await fswapPair.balanceOf(fromAddress));
    console.log(
      "aToken balance: ",
      await aTokenContract.balanceOf(fswapPair.address)
    );
    console.log(
      "bToken balance: ",
      await bTokenContract.balanceOf(fswapPair.address)
    );
    reserves = await fswapPair.getReserves();
    console.log("aToken reserve: ", reserves[0]);
    console.log("bToken reserve: ", reserves[1]);
    console.log("------------------------------------------------------------");
  });
