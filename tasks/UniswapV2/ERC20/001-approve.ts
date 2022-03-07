import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("approve", "Approve ERC20")
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

    await erc20.approve(toAddress, amount);

    console.log(`${fromAddress} approve ${amount} to ${toAddress}`);
    console.log(
      `Approved amount (${fromAddress} -> ${toAddress}): ${await erc20.allowance(
        fromAddress,
        toAddress
      )}`
    );
  });
