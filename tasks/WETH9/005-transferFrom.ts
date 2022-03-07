import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("weth:transferFrom", "TransferFrom WETH9")
  .addParam(
    "wethContractAddress",
    "WETH9 contract address",
    process.env.WETH9_CONTRACT_ADDRESS,
    types.string
  )
  .addParam("toAddress", "to address", process.env.ADDRESS2, types.string)
  .addParam("amount", "Token amount", 1, types.int)
  .setAction(async (args, hre: any) => {
    const [from] = await hre.ethers.getSigners();
    const { wethContractAddress, toAddress, amount } = args;

    const fromAddress = from.address;

    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const wETH9 = await WETH9.connect(from).attach(wethContractAddress);

    const result = await wETH9.transferFrom(fromAddress, toAddress, amount);

    console.log("");
    console.log(
      `Allowance of ${fromAddress} -> ${toAddress}: ${await wETH9.allowance(
        fromAddress,
        toAddress
      )}`
    );
    console.log(
      `Allowance of ${toAddress} -> ${fromAddress}: ${await wETH9.allowance(
        toAddress,
        fromAddress
      )}`
    );

    console.log("");
    console.log(
      `Balance of ${fromAddress}: ${await wETH9.balanceOf(fromAddress)}`
    );
    console.log(`Balance of ${toAddress}: ${await wETH9.balanceOf(toAddress)}`);

    console.log("");
    console.log(`Total supply ${await wETH9.totalSupply()}`);

    const receipt = await result.wait();
    console.log(receipt);
  });
