import { task } from "hardhat/config";

task("getRecorder", "Task to get status about Recorder")
  .addParam("recorder", "Recorder's address")
  .setAction(async (taskArgs, hre) => {
    console.log(taskArgs)

    const recorderContract = await hre.ethers.getContractAt("Recorder", taskArgs.recorder)
  
    console.log('current round: ', await recorderContract.currentRound())
    console.log('current index: ', await recorderContract.currentIndex())
    console.log('current round is saved: ', await recorderContract.isSaved(await recorderContract.currentRound()))
    console.log('operator: ', await recorderContract.operator())
  });