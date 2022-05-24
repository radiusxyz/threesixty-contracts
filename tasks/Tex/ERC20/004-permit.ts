import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

// TODO:
task("permit", "Transfer ERC20")
  .addParam(
    "tokenContractAddress",
    "Token contract address",
    "0x8198f5d8F8CfFE8f9C413d98a0A55aEB8ab9FbB7",
    types.string
  )
  .setAction(async (args, hre: any) => {
    const [owner, to] = await hre.ethers.getSigners();
    const ownerAddress = owner.address;
    const toAddress = to.address;
    const { tokenContractAddress, amount } = args;

    const ERC20 = await hre.ethers.getContractFactory("ERC20");
    const erc20 = await ERC20.attach(tokenContractAddress);

    // await erc20.permit(toAddress, amount);
    console.log("Completed");
  });
