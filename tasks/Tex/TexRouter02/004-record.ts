import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";
import { keccak256 } from "@ethersproject/keccak256";

task("recorder:addTxId", "")
  .addParam(
    "recorderContractAddress",
    "Recorder contract address",
    process.env.RECORDER_CONTRACT_ADDRESS,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const [sender] = await hre.ethers.getSigners();
    const senderAddress = sender.address;

    const abiCoder = new utils.AbiCoder();
    const txId = keccak256(
      abiCoder.encode(
        ["uint256", "address"],
        [123, "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"]
      )
    );

    const { recorderContractAddress } = args;

    const Recorder = await hre.ethers.getContractFactory("Recorder");
    const recorder = await Recorder.attach(recorderContractAddress);

    await recorder.addTxId([txId]);

    const reserves = await recorder.roundTxIdList();
    console.log(`Reserve ${reserves}`);
  });
