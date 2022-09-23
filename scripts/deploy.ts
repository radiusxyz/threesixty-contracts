import { providers } from "ethers";
import { ethers } from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  const provider = new providers.JsonRpcProvider(process.env.OPTIMISM_KOVAN_URL);
  
  const WETH9 = await ethers.getContractFactory("WETH9");
  const weth = await WETH9.deploy();
  await weth.deployed();
  console.log("WETH9 deployed to:", weth.address);
  
  const signer1 = new ethers.Wallet(process.env.PRIV_KEY1!, provider);
  const ERC20_1 = await ethers.getContractFactory("GLDToken");
  const erc20_1 = await ERC20_1.connect(signer1).deploy(ethers.utils.parseEther("1000000.0"));
  await erc20_1.deployed();
  console.log("GLDToken deployed to:", erc20_1.address);

  const signer2 = new ethers.Wallet(process.env.PRIV_KEY2!, provider);
  const ERC20_2 = await ethers.getContractFactory("SLVRToken");
  const erc20_2 = await ERC20_2.connect(signer2).deploy(ethers.utils.parseEther("1000000.0"));
  await erc20_2.deployed();
  console.log("SLVRToken deployed to:", erc20_2.address);

  const Recorder = await ethers.getContractFactory("Recorder");
  const recorder = await Recorder.deploy();
  await recorder.deployed();
  console.log("Recorder deployed to:", recorder.address);

  const TexFactory = await ethers.getContractFactory("TexFactory");
  const texFactory = await TexFactory.deploy(process.env.ACCOUNT0);
  await texFactory.deployed();
  console.log("TexFactory deployed to:", texFactory.address);
  console.log("FeeToSetterAddress:", process.env.ACCOUNT0);

  const TexRouter02 = await ethers.getContractFactory("TexRouter02");
  const texRouter02 = await TexRouter02.deploy(recorder.address, texFactory.address, weth.address, process.env.ACCOUNT0);
  await texRouter02.deployed();
  console.log("TexRouter02 deployed to:", texRouter02.address);
  await texRouter02.setFeeTo(process.env.ACCOUNT0);

  await texFactory.createPair(erc20_1.address, erc20_2.address);
  const pairAddress = await texFactory.getPair(erc20_1.address, erc20_2.address);
  console.log("pairAddress:", pairAddress);

  const content = JSON.stringify({ 
    weth: weth.address, 
    gld: erc20_1.address,
    slvr: erc20_2.address,
    recorder: recorder.address,
    factory: texFactory.address,
    router: texRouter02.address,
    pair: pairAddress
  });
  writeFileSync("deployed/contracts.json", content);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});