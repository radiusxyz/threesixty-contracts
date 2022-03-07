import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "ethers";

task("weth:deposit", "")
  .addParam(
    "wethContractAddress",
    "WETH9 contract address",
    process.env.WETH9_CONTRACT_ADDRESS,
    types.string
  )
  .addParam("amountIn", "", 2, types.int)
  .setAction(async (args, hre: any) => {
    const [from] = await hre.ethers.getSigners();
    const fromAddress = from.address;
    const { wethContractAddress } = args;
    let { amountIn } = args;

    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const wETH9 = await WETH9.attach(wethContractAddress);

    const decimal = BigNumber.from(10).pow(18);
    amountIn = BigNumber.from(amountIn).mul(decimal).toString();

    const result = await wETH9.deposit({ value: amountIn });

    console.log(`Total supply ${await wETH9.totalSupply()}`);
    console.log(
      `${fromAddress} balances is ${await wETH9.balanceOf(fromAddress)}`
    );

    const receipt = await result.wait();
    console.log(receipt);
  });
