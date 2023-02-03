import { task } from "hardhat/config";

task("setOperator", "Task to set operator with params")
  .addParam("router", "Router's address")
  .addParam("operator", "Operator's address")
  .setAction(async (taskArgs, hre) => {
    console.log(taskArgs);

    const accounts = await hre.ethers.getSigners();
    const routerContract = await hre.ethers.getContractAt("ThreesixtyRouter02", taskArgs.router);
  
    const tx1 = await routerContract.setOperator(taskArgs.operator);
    await tx1.wait();
    
    console.log('operator: ', await routerContract.operator());
  });