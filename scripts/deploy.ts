import { ethers } from "hardhat"
import { writeFileSync } from "fs"
import { copySync } from "fs-extra"

async function main() {
  const accounts = await ethers.getSigners()

  const texFactory = await ethers.getContractAt("ITexFactory", "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32")
  console.log("TexFactory deployed to:", texFactory.address)

  const Recorder = await ethers.getContractFactory("Recorder")
  const recorder = await Recorder.deploy()
  await recorder.deployed()
  console.log("Recorder deployed to:", recorder.address)
  await recorder.transferOwnership(accounts[0].address)

  const wETHContractAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270"
  const flashAddress = "0x522Cb07FFA9Fe1ae750Db8a8F632931cDca080FB"

  const TexRouter02 = await ethers.getContractFactory("TexRouter02")
  const texRouter02 = await TexRouter02.deploy(
    recorder.address,
    texFactory.address,
    wETHContractAddress,
    accounts[0].address,
    accounts[0].address,
    flashAddress
  )
  await texRouter02.deployed()
  console.log("TexRouter02 deployed to:", texRouter02.address)
  await texRouter02.setOperator(accounts[0].address)
  await texRouter02.setFeeTo(accounts[0].address)

  const Mimc = await ethers.getContractFactory("Mimc")
  const mimcContract = await Mimc.deploy();
  await texRouter02.deployed()
  console.log("Mimc deployed to:", mimcContract.address)

  const content = JSON.stringify({
    weth: wETHContractAddress,
    recorder: recorder.address,
    factory: texFactory.address,
    router: texRouter02.address,
    mimc: mimcContract.address
  })
  writeFileSync("deployed/contracts.json", content)
  copySync("artifacts", "deployed/artifacts")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
