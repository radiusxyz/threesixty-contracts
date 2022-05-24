import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

export const Sleep = (delay: number) =>
  new Promise(resolve => setTimeout(resolve, delay));

task("temp3", "")
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
    const recorder = await Recorder.attach(recorderContractAddress);

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

    let remainingTxccount = accounts.length;
    for (const i in accounts) {
      const account = accounts[i];
      const address = accounts[i].address;
      const currentRouter = texRouter02.connect(account);

      currentRouter
        .swapExactTokensForTokens(
          `${process.env.IN_AMOUNT}`,
          `${process.env.OUT_AMOUNT}`,
          paths[i as any],
          address,
          process.env.DEADLINE,
          { gasPrice: 8000000000, gasLimit: 9026904 }
        )
        .then((result: any) => {
          console.log(result.hash);
          console.log(`Complete to sent swap tx`);
          remainingTxccount--;
          if (remainingTxccount == 0) {
            console.log(`---End (swap)----------`);
            process.exit();
          }
        });
    }

    await Sleep(100000000);
  });
