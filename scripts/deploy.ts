import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { copySync } from "fs-extra";

async function main() {
  const networkId = (await ethers.provider.getNetwork()).chainId;

  const accounts = await ethers.getSigners();

  const factoryAddress = "0x5757371414417b8c6caad45baef941abc7d3ab32"; //QuickSwap Factory
  const wETHAddress = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
  let usdtAddress = "0x21C561e551638401b937b03fE5a0a0652B99B7DD";
  let poolAddressesProviderAddress = "0x5343b5bA672Ae99d627A1C87866b8E53F47Db2E6";
  if (networkId == 137) {
    usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
    poolAddressesProviderAddress = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
  }

  let usdtContract = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", usdtAddress)

  const Backer = await ethers.getContractFactory("Backer");
  const backer = await Backer.deploy(poolAddressesProviderAddress);
  await backer.deployed();
  console.log("Backer deployed to:", backer.address);

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(usdtAddress);
  console.log("Vault deployed to:", vault.address);

  const ThreesixtyRouter02 = await ethers.getContractFactory("ThreesixtyRouter02");
  const threesixtyRouter02 = await ThreesixtyRouter02.deploy(
    networkId,
    vault.address, 
    factoryAddress, 
    wETHAddress, 
    accounts[0].address, 
    accounts[0].address, 
    backer.address, 
    ethers.utils.parseUnits('0.01', 6)
    );
  await threesixtyRouter02.deployed();
  console.log("360Router02 deployed to:", threesixtyRouter02.address);
  await threesixtyRouter02.setMiddleAddress(usdtAddress);
  await threesixtyRouter02.setOperator(accounts[2].address);
  await threesixtyRouter02.setFeeTo(accounts[2].address);


  const Recorder = await ethers.getContractFactory("Recorder");
  const recorder = await Recorder.attach(await threesixtyRouter02.recorder());
  console.log("Recorder deployed to:", recorder.address);

  await vault.setRouter(threesixtyRouter02.address);
  await usdtContract.approve(vault.address, ethers.utils.parseUnits('0.2', 6));
  await vault.deposit(ethers.utils.parseUnits('0.2', 6));

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
  if(networkId == 137) {
    copySync("package_polygon.json","deployed/package.json");
    copySync("tokens_polygon.json","deployed/tokens.json");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
