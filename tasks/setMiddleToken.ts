import { task } from "hardhat/config";

task("setMiddleToken", "Task to set middle token with params")
  .addParam("router", "Router's address")
  .addParam("middletoken", "Middle token's address")
  .setAction(async (taskArgs, hre) => {
    console.log(taskArgs);

    const accounts = await hre.ethers.getSigners()
    const routerContract = await hre.ethers.getContractAt("ThreesixtyRouter02", taskArgs.router)
  
    const tx1 = await routerContract.connect(accounts[1]).setMiddleAddress(taskArgs.middletoken);
    await tx1.wait();
    
    console.log('operator: ', await routerContract.operator())
    console.log('middletoken: ', await routerContract.middleAddress())
  });