import { ethers } from "hardhat"

async function main() {
  const accounts = await ethers.getSigners()
  const client = accounts[0]

  const routerContractAddress = "0x8954AfA98594b838bda56FE4C12a09D7739D179b" // ThreesixtyRouter

  const amountIn = "500000"
  const TokenContractAddress = "0x5E37430286E962451a0Aa2FB58528C7D82c9C33C" // UNI
  const aTokenContractAddress = "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2" // USDC
  const bTokenContractAddress = "0x21c561e551638401b937b03fe5a0a0652b99b7dd" // USDT

  const routerContract = await ethers.getContractAt("@uniswap/v2-periphery/contracts/UniswapV2Router02.sol:UniswapV2Router02", routerContractAddress)
  const aTokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20", aTokenContractAddress)

  const approveResult = await aTokenContract.approve(routerContract.address, amountIn)
  await approveResult.wait()

  const swapResult = await routerContract.swapExactTokensForTokens(amountIn, "0", [
    aTokenContractAddress,
    bTokenContractAddress,
  ], client.address, Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2);
  await swapResult.wait()
  console.log("Complete swap", swapResult.hash)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
