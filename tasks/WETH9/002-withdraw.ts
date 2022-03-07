import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("weth:withdraw", "")
  .addParam(
    "wethContractAddress",
    "WETH9 contract address",
    process.env.WETH9_CONTRACT_ADDRESS,
    types.string
  )
  .addParam("amountOut", "", 2, types.int)
  .setAction(async (args, hre: any) => {
    const [from] = await hre.ethers.getSigners();
    const fromAddress = from.address;
    const { wethContractAddress, amountOut } = args;

    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const wETH9 = await WETH9.attach(wethContractAddress);

    const result = await wETH9.withdraw(amountOut);

    console.log(`Total supply ${await wETH9.totalSupply()}`);
    console.log(
      `${fromAddress} balances is ${await wETH9.balanceOf(fromAddress)}`
    );

    const receipt = await result.wait();
    console.log(receipt);
  });
