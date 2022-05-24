import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("transfer", "Transfer ERC20")
  .addParam(
    "tokenContractAddress",
    "Token contract address",
    "0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7",
    types.string
  )
  .addParam("amount", "Token amount", 1, types.int)
  .setAction(async (args, hre: any) => {
    const [from, to] = await hre.ethers.getSigners();
    const fromAddress = from.address;
    const toAddress = to.address;
    const { tokenContractAddress, amount } = args;

    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.attach(tokenContractAddress);

    await erc20.transfer(toAddress, amount);

    console.log(`${fromAddress} transfer ${amount} to ${toAddress}`);
    console.log(
      `Balance of ${fromAddress}: ${await erc20.balanceOf(fromAddress)}`
    );
    console.log(`Balance of ${toAddress}: ${await erc20.balanceOf(toAddress)}`);
  });
