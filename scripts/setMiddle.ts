///////////////////////////////////////////////////////////
//This script is not a final version
//Please check it first when you try
///////////////////////////////////////////////////////////


import { ethers } from "hardhat"

async function main() {
  const accounts = await ethers.getSigners()

  const routerContract = await ethers.getContractAt("ThreesixtyRouter02", "0x582f6Daad6Ecca28eF526ded4F177759489a7E37")

  await routerContract.setOperator(accounts[2].address);
  await routerContract.connect(accounts[2]).setMiddleAddress("0x21c561e551638401b937b03fe5a0a0652b99b7dd");
  console.log(await routerContract.middleAddress())
  console.log(await routerContract.operator())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})