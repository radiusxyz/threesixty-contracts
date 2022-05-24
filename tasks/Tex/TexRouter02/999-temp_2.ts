import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

export const Sleep = (delay: number) =>
  new Promise(resolve => setTimeout(resolve, delay));

task("temp2", "")
  .addParam(
    "routerContractAddress",
    "Router contract address",
    process.env.ROUTER_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "pairContractAddress",
    "A token pair contract address",
    process.env.TOKEN_PAIR_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "recorderContractAddress",
    "Recorder contract address",
    process.env.RECORDER_CONTRACT_ADDRESS,
    types.string
  )
  .addParam("amount", "", process.env.IN_AMOUNT, types.string)
  .setAction(async (args, hre: any) => {
    const accounts = await hre.ethers.getSigners();

    const {
      amount,
      routerContractAddress,
      pairContractAddress,
      recorderContractAddress,
    } = args;

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const TexRouter02 = await hre.ethers.getContractFactory("TexRouter02");
    const ERC20 = await hre.ethers.getContractFactory("WETH9");
    const Recorder = await hre.ethers.getContractFactory("Recorder");
    const recorder = await Recorder.attach(recorderContractAddress).connect(
      accounts[2]
    );

    const texPair = await TexPair.attach(pairContractAddress);
    const texRouter02 = await TexRouter02.attach(routerContractAddress);
    const aTokenContract = await ERC20.attach(await texPair.token0());
    const bTokenContract = await ERC20.attach(await texPair.token1());

    // console.log(`--------Start addTxId--------`);
    // const result = await recorder.addTxId([txId, txId2]);
    // const receipt = await result.wait();
    // console.log(`Complete addTxId - ${receipt.transactionHash}`);
    const paths = [
      [aTokenContract.address, bTokenContract.address],
      [bTokenContract.address, aTokenContract.address],
    ];

    const txIds = [];
    for (const i in accounts) {
      const address = accounts[i].address;

      console.log(process.env.IN_AMOUNT);
      console.log(process.env.OUT_AMOUNT);
      console.log(paths[i as any]);
      console.log(address);
      console.log(process.env.DEADLINE);

      const txId = hre.ethers.utils.solidityKeccak256(
        ["address", "uint256", "uint256", "address[]", "address", "uint256"],
        [
          address,
          `${process.env.IN_AMOUNT}`,
          `${process.env.OUT_AMOUNT}`,
          paths[i as any],
          address,
          process.env.DEADLINE,
        ]
      );
      console.log(`-----Tx ${i}-------------------`);
      console.log(`Address: ${address}`);
      console.log(`Amount in: ${process.env.IN_AMOUNT}`);
      console.log(`Amount out: ${process.env.OUT_AMOUNT}`);
      console.log(`Path: [${paths[(i as any) % 2]}]`);
      console.log(`Deadline: ${process.env.DEADLINE}`);
      console.log(`Txid: ${txId}`);
      console.log(`----------------------------------`);
      console.log();
      txIds.push(txId);
    }
    console.log(txIds);

    const result = await recorder.addTxId(txIds);
    const receipt = await result.wait();
    console.log(`Complete addTxId - ${receipt.transactionHash}`);
  });
