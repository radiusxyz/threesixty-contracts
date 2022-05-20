import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "@ethersproject/bignumber";

task("calHash", "")
  .addParam(
    "contractAddress",
    "",
    process.env.CAL_HASH_CONTRACT_ADDRESS,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const { contractAddress } = args;

    const CalHash = await hre.ethers.getContractFactory(
      "contracts/UniswapV2/CalHash.sol:CalHash"
    );
    const calHah = await CalHash.attach(contractAddress);
    console.log(calHah);

    console.log("Init hash: ", await calHah.getInitHash());
  });
