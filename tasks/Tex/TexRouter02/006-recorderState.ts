import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";
import { keccak256 } from "@ethersproject/keccak256";

task("recorder:state", "")
  .addParam(
    "recorderContractAddress",
    "Recorder contract address",
    process.env.RECORDER_CONTRACT_ADDRESS,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const { recorderContractAddress } = args;

    const Recorder = await hre.ethers.getContractFactory("Recorder");
    const recorder = await Recorder.attach(recorderContractAddress);
    const currentRound = await recorder.currentRound();
    const currentIndex = await recorder.currentIndex();
    const owner = await recorder.owner();
    const isSaved = await recorder.isSaved(currentRound);

    let roundTxId1;
    let roundTxId2;

    if (isSaved == true) {
      roundTxId1 = await recorder.roundTxIdList(currentRound, 0);
      roundTxId2 = await recorder.roundTxIdList(currentRound, 1);
    }

    console.log("currentRound", currentRound);
    console.log("currentIndex", currentIndex);
    console.log("owner", owner);
    console.log("isSaved", isSaved);
    console.log("roundTxId1;", roundTxId1);
    console.log("roundTxId2;", roundTxId2);
  });
