import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {

  const accounts = await ethers.getSigners();

  const Mimc = await ethers.getContractFactory("contracts/test/Mimc.sol:Mimc");
  const mimc = await Mimc.deploy();
  await mimc.deployed();
  console.log("Mimc deployed to:", mimc.address);

  const content = JSON.stringify({
    mimc: mimc.address
  });
  writeFileSync("test/contracts.json", content);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});