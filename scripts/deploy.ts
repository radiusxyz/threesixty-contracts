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
  let middleTokenAddress = "0x21C561e551638401b937b03fE5a0a0652B99B7DD"  //usdt
  if (networkId == 137) {
    usdtAddress = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
    poolAddressesProviderAddress = "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb";
    middleTokenAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"  //usdc
  }

  let usdtContract = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", usdtAddress)

  const Backer = await ethers.getContractFactory("Backer");
  const backer = await Backer.deploy(poolAddressesProviderAddress);
  await backer.deployed();
  console.log("Backer deployed to:", backer.address);

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(usdtAddress);
  await vault.deployed();
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
  const tx1 = await threesixtyRouter02.setOperator(accounts[1].address);
  await tx1.wait();
  const tx2 = await threesixtyRouter02.setFeeTo(accounts[1].address);
  await tx2.wait();
  const tx3 = await threesixtyRouter02.connect(accounts[1]).setMiddleAddress(middleTokenAddress);
  await tx3.wait();

  const Recorder = await ethers.getContractFactory("Recorder");
  const recorder = await Recorder.attach(await threesixtyRouter02.recorder());
  console.log("Recorder deployed to:", recorder.address);

  const tx4 = await vault.setRouter(threesixtyRouter02.address);
  await tx4.wait();
  const tx5 = await usdtContract.approve(vault.address, ethers.utils.parseUnits('0.2', 6));
  await tx5.wait();
  const tx6 = await vault.deposit(ethers.utils.parseUnits('0.2', 6));
  await tx6.wait();

  console.log("Operator: ", await threesixtyRouter02.operator());
  console.log("MiddleToken: ", await threesixtyRouter02.middleAddress());
  console.log("Vault has %d usdt", await usdtContract.balanceOf(vault.address));

  const content = JSON.stringify({
    weth: wETHAddress,
    recorder: recorder.address,
    factory: factoryAddress,
    router: threesixtyRouter02.address,
    backer: backer.address,
    vault: vault.address
  });
  if(networkId == 137) {  
    writeFileSync("deployed/polygon_main/contracts.json", content);
    copySync("artifacts","deployed/polygon_main/artifacts");
    copySync("tokens_polygon.json","deployed/polygon_main/tokens.json");
  } else {
    writeFileSync("deployed/polygon_dev/contracts.json", content);
    copySync("artifacts","deployed/polygon_dev/artifacts");
    copySync("tokens_mumbai.json","deployed/polygon_dev/tokens.json");
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
