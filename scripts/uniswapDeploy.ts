import { ethers } from "hardhat"

async function main() {
  const accounts = await ethers.getSigners()

  const factoryContractAddress = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32"
  const wETHContractAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"

  const UniswapV2Router02 = await ethers.getContractFactory("UniswapV2Router02")
  const UniswapV2Router02Contract = await UniswapV2Router02.deploy(
    factoryContractAddress,
    wETHContractAddress
  )
  await UniswapV2Router02Contract.deployed()
  console.log("UniswapV2Router02 deployed to:", UniswapV2Router02Contract.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
