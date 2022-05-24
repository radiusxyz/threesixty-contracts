import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "@ethersproject/bignumber";

task("tt", "").setAction(async (args, hre: any) => {
  const txId = hre.ethers.utils.solidityKeccak256(
    ["address", "uint256", "uint256", "address[]", "address", "uint256"],
    [
      "0x2578F573c28B53c088C928e5722FD944e2279EC6",
      "10000000000000000000",
      "0",
      [
        "0x8F4EAf4475a45DDDf70A8c9132b72Cf0BA036FE8",
        "0xA510e8077EA0cC32Ff393905fdA20CDdC97B909F",
      ],
      "0x2578F573c28B53c088C928e5722FD944e2279EC6",
      "1753105128",
    ]
  );

  console.log(txId);
});
