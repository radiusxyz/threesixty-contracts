import { task } from "hardhat/config";

task("setMiddleToken", "Task to set middle token with params")
  .addParam("router", "Router's address")
  .addParam("middletoken", "Middle token's address")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()
    const routerContract = await hre.ethers.getContractAt("ThreesixtyRouter02", taskArgs.router)
  
    await routerContract.setOperator(accounts[1].address);
    await routerContract.connect(accounts[1]).setMiddleAddress(taskArgs.middletoken);
    
    console.log(taskArgs);
    console.log('router: ', await routerContract.address)
    console.log('operator: ', await routerContract.operator())
    console.log('middletoken: ', await routerContract.middleAddress())
  });