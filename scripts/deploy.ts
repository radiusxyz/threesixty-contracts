import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { copySync } from "fs-extra";

async function main() {

  const accounts = await ethers.getSigners();

  const TexPair = await ethers.getContractFactory("TexPair");
  console.log("%% Modify TexLibrary.sol file if you change something in TexPair.sol");
  console.log("TexPair address:", ethers.utils.solidityKeccak256(["bytes"],[TexPair.bytecode]));
  
  const WETH9 = await ethers.getContractFactory("TestERC20");
  const weth = await WETH9.deploy("Wrapped Ether", "WETH", ethers.utils.parseUnits("1000000", 18));
  await weth.deployed();
  console.log("WETH9 deployed to:", weth.address);
  
  const ERC20_1 = await ethers.getContractFactory("TestERC20");
  const erc20_1 = await ERC20_1.deploy("Gold token", "GLD", ethers.utils.parseUnits("1000000", 18));
  await erc20_1.deployed();
  console.log("GLDToken deployed to:", erc20_1.address);

  const ERC20_2 = await ethers.getContractFactory("TestERC20");
  const erc20_2 = await ERC20_2.deploy("Silver token", "SLVR", ethers.utils.parseUnits("1000000", 18));
  await erc20_2.deployed();
  console.log("SLVRToken deployed to:", erc20_2.address);

  const Recorder = await ethers.getContractFactory("Recorder");
  const recorder = await Recorder.deploy();
  await recorder.deployed();
  console.log("Recorder deployed to:", recorder.address);
  await recorder.transferOwnership(accounts[2].address);

  // const TexFactory = await ethers.getContractFactory("TexFactory");
  // const texFactory = await TexFactory.deploy(accounts[0].address);
  // await texFactory.deployed();
  const texFactoryAddress = "0xbAfD1699456Fa07681e574B0B30aB1A996e6373e"
  const texFactoryAbi = [
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenA",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "tokenB",
          "type": "address"
        }
      ],
      "name": "createPair",
      "outputs": [
        {
          "internalType": "address",
          "name": "pair",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "getPair",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "address",
          "name": "_feeToSetter",
          "type": "address"
        }
      ],
      "name": "setFeeToSetter",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
  const texFactory = new ethers.Contract(texFactoryAddress,texFactoryAbi,accounts[0]);
  //await texFactory.setFeeToSetter(accounts[2].address);
  console.log("TexFactory deployed to:", texFactory.address);
  console.log("FeeToSetterAddress:", accounts[2].address);

  const pair = await texFactory.createPair(erc20_1.address, erc20_2.address);

  const TexRouter02 = await ethers.getContractFactory("TexRouter02");
  const texRouter02 = await TexRouter02.deploy(recorder.address, texFactory.address, weth.address, accounts[0].address, accounts[0].address);
  await texRouter02.deployed();
  console.log("TexRouter02 deployed to:", texRouter02.address);
  await texRouter02.setOperator(accounts[2].address);
  await texRouter02.setFeeTo(accounts[2].address);
  
  const pairAddress = await texFactory.getPair(erc20_1.address, erc20_2.address);
  console.log("pairAddress:", pairAddress);

  await erc20_1.approve(texRouter02.address, ethers.utils.parseUnits("10000", 18));
  await erc20_2.approve(texRouter02.address, ethers.utils.parseUnits("10000", 18));

  await texRouter02.addLiquidity(
    erc20_1.address,
    erc20_2.address,
    ethers.utils.parseUnits("2", 18),
    ethers.utils.parseUnits("2", 18),
    ethers.utils.parseUnits("1", 18),
    ethers.utils.parseUnits("1", 18),
    accounts[2].address,
    1766730046
  );

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
  copySync("artifacts","deployed/artifacts");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
