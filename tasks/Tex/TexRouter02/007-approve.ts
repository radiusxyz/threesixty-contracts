import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

export const Sleep = (delay: number) =>
  new Promise(resolve => setTimeout(resolve, delay));

task("router:approve", "")
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
  .addParam("amount", "", process.env.IN_AMOUNT, types.string)
  .setAction(async (args, hre: any) => {
    const accounts = await hre.ethers.getSigners();

    const { amount, routerContractAddress, pairContractAddress } = args;

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const ERC20 = await hre.ethers.getContractFactory("WETH9");

    const fswapPair = await TexPair.attach(pairContractAddress);
    const aTokenContract = await ERC20.attach(await fswapPair.token0());
    const bTokenContract = await ERC20.attach(await fswapPair.token1());

    const aTokenName = await aTokenContract.name();
    const aTokenSymbol = await aTokenContract.symbol();
    const aTokenAddress = aTokenContract.address;

    const bTokenName = await bTokenContract.name();
    const bTokenSymbol = await bTokenContract.symbol();
    const bTokenAddress = bTokenContract.address;

    const reserves = await fswapPair.getReserves();

    console.log(`${aTokenName}(${aTokenSymbol}): ${aTokenAddress}`);
    console.log(`${bTokenName}(${bTokenSymbol}): ${bTokenAddress}`);
    console.log(
      `Pair(${fswapPair.address})\n${aTokenName} reserve: ${reserves[0]}\n${bTokenName} reserve: ${reserves[1]}\n\n`
    );

    const contracts = [aTokenContract, bTokenContract];

    console.log(`---Start (approve)--------`);
    for (const i in accounts) {
      const account = accounts[i];
      const address = accounts[i].address;
      const contract = contracts[(i as any) % 2].connect(account);
      const tokenName = await contract.name();

      console.log(`---${address} account ---------------------`);
      console.log(`${aTokenName}: ${await aTokenContract.balanceOf(address)}`);
      console.log(`${bTokenName}: ${await bTokenContract.balanceOf(address)}`);
      console.log();
      console.log(`Try to approve ${routerContractAddress} / ${amount}`);

      const result = await contract.approve(routerContractAddress, amount);
      const receipt = await result.wait();
      console.log(
        `${tokenName} approve to ${routerContractAddress} : ${await contract.allowance(
          address,
          routerContractAddress
        )}`
      );
      console.log(`Complete addTxId - ${receipt.transactionHash}`);
      console.log(`-------------------------------------------`);
      console.log();
    }
    console.log(`---End (approve)----------`);
  });
