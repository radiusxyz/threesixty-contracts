import { ethers } from "hardhat";

async function main() {
  const accounts = await ethers.getSigners()

  const poolAddressesProviderAddress = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6"
  // const backerContract = await ethers.getContractAt("Backer", "0x452027d10D9b2b0544f59c8C014ae46f9a6DAFB4")
  const Backer = await ethers.getContractFactory("Backer")
  const backerContract = await Backer.deploy(poolAddressesProviderAddress)
  console.log("Flashloan contract address: ", backerContract.address)

  const threesixtyRouterAddress = "0xcd7eCe895B6B3Bd3219012AE01EB37eE8653599B" // ThreesixtyRouter
  const threesixtyRouterContract = await ethers.getContractAt("ThreesixtyRouter", threesixtyRouterAddress)

  const quickswapRouterAddress = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"
  const quickswapRouterContract = await ethers.getContractAt("@uniswap/v2-periphery/contracts/UniswapV2Router02.sol:UniswapV2Router02", quickswapRouterAddress)

  const aTokenAddress = "0x5E37430286E962451a0Aa2FB58528C7D82c9C33C"
  const bTokenAddress = "0x9aa7fec87ca69695dd1f879567ccf49f3ba417e2"
  const backerTokenAddress = "0x21c561e551638401b937b03fe5a0a0652b99b7dd"
  let aTokenContract = await ethers.getContractAt("@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20", aTokenAddress)

  const amountIn = "200000000000000"
  const amountOutMin = "0"
  const path = [aTokenAddress, bTokenAddress]
  const backerSwapPath = [bTokenAddress, aTokenAddress, backerTokenAddress, bTokenAddress]
  let amounts = await quickswapRouterContract.getAmountsOut(amountIn, path);

  const approveResult = await aTokenContract.approve(quickswapRouterAddress, amountIn)
  await approveResult.wait()

  const swapResult = await quickswapRouterContract.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    path,
    accounts[0].address,
    1968845350
  )
  await swapResult.wait()
  console.log("Complete swap txHash (user): ", swapResult.hash)

  console.log("UNI: ", amounts[0].toString())
  console.log("USDC: ", amounts[1].toString())
  console.log("")

  const backerSwapAmounts = await threesixtyRouterContract.getAmountsOut(amounts[1].toString(), backerSwapPath);

  console.log("USDC: ", backerSwapAmounts[0].toString())
  console.log("UNI: ", backerSwapAmounts[1].toString())
  console.log("USDT: ", backerSwapAmounts[2].toString())
  console.log("USDC: ", backerSwapAmounts[3].toString())
  console.log("")

  amounts = await threesixtyRouterContract.getAmountsOut(amountIn, [
    aTokenAddress,
    backerTokenAddress
  ]);
  console.log("UNI: ", amounts[0].toString())
  console.log("USDT: ", amounts[1].toString())
  console.log("")

  amounts = await threesixtyRouterContract.getAmountsOut(amountIn, [
    bTokenAddress,
    backerTokenAddress
  ]);
  console.log("USDC: ", amounts[0].toString())
  console.log("USDT: ", amounts[1].toString())
  console.log("")

  amounts = await threesixtyRouterContract.getAmountsOut(amountIn, [
    aTokenAddress,
    backerTokenAddress,
    bTokenAddress,
  ]);
  console.log("UNI: ", amounts[0].toString())
  console.log("USDT: ", amounts[1].toString())
  console.log("USDC: ", amounts[2].toString())
  console.log("")

  const backerSwapResult = await backerContract.swap(backerSwapAmounts[0].toString(), backerSwapPath, "1703061335");

  await backerSwapResult.wait()
  console.log(backerSwapResult.hash)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
