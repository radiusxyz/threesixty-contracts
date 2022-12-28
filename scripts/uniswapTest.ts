import { ethers } from "hardhat"

async function main() {
  const routerContractAddress = "0x51828045409d45C3DED475C1452a66296fBa780f" // TexRouter

  const amountIn = "200000000000000"
  const aTokenContractAddress = "0x5E37430286E962451a0Aa2FB58528C7D82c9C33C" // UNI
  const bTokenContractAddress = "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2" // USDC

  const routerContract = await ethers.getContractAt("UniswapV2Router02", routerContractAddress)

  const amounts = await routerContract.getAmountsOut(amountIn, [aTokenContractAddress, bTokenContractAddress]);
  console.log("amounts", amounts)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
