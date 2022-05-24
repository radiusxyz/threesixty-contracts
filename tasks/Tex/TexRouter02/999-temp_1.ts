import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

export const Sleep = (delay: number) =>
  new Promise(resolve => setTimeout(resolve, delay));

task("temp1", "")
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
  .setAction(async (args, hre: any) => {
    const accounts = await hre.ethers.getSigners();

    const { routerContractAddress, pairContractAddress } = args;

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const ERC20 = await hre.ethers.getContractFactory("WETH9");

    const texPair = await TexPair.attach(pairContractAddress);
    const aTokenContract = await ERC20.attach(await texPair.token0());
    const bTokenContract = await ERC20.attach(await texPair.token1());
    const amounts = ["1000000000000000000", "1000000000000000000"];

    console.log(await aTokenContract.name());
    console.log(await bTokenContract.name());

    console.log(`---Start (approve)--------`);
    const contracts = [aTokenContract, bTokenContract];

    for (const i in accounts) {
      const account = accounts[i];

      console.log((i as any) % 2);
      console.log(await contracts[(i as any) % 2].name());
      console.log(account.address);
      const contract = contracts[(i as any) % 2].connect(account);

      const result = await contract.approve(
        routerContractAddress,
        amounts[i as any]
      );
      const receipt = await result.wait();
      console.log(result.hash);
    }
    console.log(`---End (approve)----------`);
  });
