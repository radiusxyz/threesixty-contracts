import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { copySync } from "fs-extra";

async function main() {

  const accounts = await ethers.getSigners();

  const factoryAddress = "0x5757371414417b8c6caad45baef941abc7d3ab32"; //QuickSwap Factory
  const wETHAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
  const maticAddress = "0xCCc379b885ABA6820304E8eC9DC979Bdd8941b6e";

  const poolAddressesProviderAddress = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6";

  const Backer = await ethers.getContractFactory("Backer");
  const backer = await Backer.deploy(poolAddressesProviderAddress);
  await backer.deployed();
  console.log("Backer deployed to:", backer.address);

  const Recorder = await ethers.getContractFactory("Recorder");
  const recorder = await Recorder.deploy();
  await recorder.deployed();
  console.log("Recorder deployed to:", recorder.address);
  await recorder.transferOwnership(accounts[2].address);

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(maticAddress);
  console.log("Vault deployed to:", vault.address);

  const ThreesixtyRouter02 = await ethers.getContractFactory("ThreesixtyRouter02");
  const threesixtyRouter02 = await ThreesixtyRouter02.deploy(recorder.address, vault.address, factoryAddress, wETHAddress, accounts[0].address, accounts[0].address, backer.address, ethers.utils.parseUnits('1', 18));
  await threesixtyRouter02.deployed();
  console.log("360Router02 deployed to:", threesixtyRouter02.address);
  await threesixtyRouter02.setOperator(accounts[2].address);
  await threesixtyRouter02.setFeeTo(accounts[2].address);

  await vault.setOperator(threesixtyRouter02.address);



  const content = JSON.stringify({
    weth: wETHAddress,
    recorder: recorder.address,
    factory: factoryAddress,
    router: threesixtyRouter02.address,
    backer: backer.address,
    vault: vault.address
  });
  writeFileSync("deployed/contracts.json", content);
  copySync("artifacts","deployed/artifacts");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
