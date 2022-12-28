import { ethers } from "hardhat"

async function main() {
  const accounts = await ethers.getSigners()
  const routerContractAddress = "0x999873eF122Ed7b7fDBcC0A11E69c953F583Db0D"
  const aTokenContractAddress = "0x5E37430286E962451a0Aa2FB58528C7D82c9C33C"
  const bTokenContractAddress = "0x9aa7fec87ca69695dd1f879567ccf49f3ba417e2"

  const routerContract = await ethers.getContractAt("TexRouter02", routerContractAddress)
  const factoryContractAddress = await routerContract.factory()
  const factoryContract = await ethers.getContractAt("ITexFactory", factoryContractAddress)

  const pairContractAddress = await factoryContract.getPair(aTokenContractAddress, bTokenContractAddress)

  const pairContract = await ethers.getContractAt("ITexPair", pairContractAddress)
  const reserves = await pairContract.getReserves()

  const aTokenContract = await ethers.getContractAt("ERC20", await pairContract.token0())
  const aTokenName = await aTokenContract.name()
  const aTokenSymbol = await aTokenContract.symbol()

  const bTokenContract = await ethers.getContractAt("ERC20", await pairContract.token1())
  const bTokenName = await bTokenContract.name()
  const bTokenSymbol = await bTokenContract.symbol()

  console.log("Pair contract address: ", pairContract.address)
  console.log(`${aTokenName} (${aTokenSymbol}): `, reserves[0].toString())
  console.log(`${bTokenName} (${bTokenSymbol}): `, reserves[1].toString())
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
