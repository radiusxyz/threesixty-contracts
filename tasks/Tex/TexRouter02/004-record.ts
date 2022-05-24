import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";

task("recorder:addTxId", "")
  .addParam(
    "aTokenContractAddress",
    "ERC20 contract address",
    process.env.ERC20_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "bTokenContractAddress",
    "ERC20 contract address",
    process.env.ERC20_CONTRACT_ADDRESS2,
    types.string
  )
  .addParam(
    "recorderContractAddress",
    "Recorder contract address",
    process.env.RECORDER_CONTRACT_ADDRESS,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const accounts = await hre.ethers.getSigners();

    const {
      recorderContractAddress,
      aTokenContractAddress,
      bTokenContractAddress,
    } = args;

    const paths = [
      [aTokenContractAddress, bTokenContractAddress],
      [bTokenContractAddress, aTokenContractAddress],
    ];

    const txIds = [];
    for (const i in accounts) {
      const address = accounts[i].address;
      const txId = hre.ethers.utils.solidityKeccak256(
        ["address", "uint256", "uint256", "address[]", "address", "uint256"],
        [
          address,
          process.env.IN_AMOUNT,
          process.env.OUT_AMOUNT,
          paths[(i as any) % 2],
          address,
          process.env.DEADLINE,
        ]
      );
      console.log(`-----Tx ${i}-------------------`);
      console.log(`Address: ${address}`);
      console.log(`Txid: ${txId}`);
      console.log(`----------------------------------`);
      console.log();
      txIds.push(txId);
    }

    const Recorder = await hre.ethers.getContractFactory("Recorder");
    const recorder = await Recorder.attach(recorderContractAddress);

    const result = await recorder.addTxId(txIds);
    const receipt = await result.wait();
    console.log(`Complete addTxId - ${receipt.transactionHash}`);
  });
