import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

task("router:swapExactTokensForTokens", "")
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
  .addParam("amountIn", "", 10, types.int)
  .addParam("amountoutMin", "", 0, types.int)
  .setAction(async (args, hre: any) => {
    const [sender] = await hre.ethers.getSigners();
    const senderAddress = sender.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2; // 2 days

    const { routerContractAddress, pairContractAddress } = args;

    let { amountIn, amountoutMin } = args;
    const decimal = BigNumber.from(10).pow(18);
    amountIn = BigNumber.from(amountIn).mul(decimal).toString();
    amountoutMin = BigNumber.from(amountoutMin).mul(decimal).toString();

    const TexRouter02 = await hre.ethers.getContractFactory("TexRouter02");
    const fswapRouter02 = await TexRouter02.attach(routerContractAddress);

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const fswapPair = await TexPair.attach(pairContractAddress);

    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const aTokenContract = await WETH9.attach(await fswapPair.token0());
    const bTokenContract = await WETH9.attach(await fswapPair.token1());

    const aTokenName = await aTokenContract.name();
    const bTokenName = await bTokenContract.name();

    console.log(
      `${aTokenName} balance is ${await aTokenContract.balanceOf(
        senderAddress
      )}`
    );
    console.log(
      `${bTokenName} balance is ${await bTokenContract.balanceOf(
        senderAddress
      )}`
    );
    console.log();

    console.log("After swap ------------------");

    let result = await aTokenContract.approve(routerContractAddress, amountIn);
    let receipt = await result.wait();

    result = await fswapRouter02.swapExactTokensForTokens(
      amountIn,
      amountoutMin,
      [aTokenContract.address, bTokenContract.address],
      senderAddress,
      deadline
    );
    receipt = await result.wait();

    console.log(
      `${aTokenName} balance is ${await aTokenContract.balanceOf(
        senderAddress
      )}`
    );
    console.log(
      `${bTokenName} balance is ${await bTokenContract.balanceOf(
        senderAddress
      )}`
    );
    console.log();

    const reserves = await fswapPair.getReserves();
    console.log(`Reserve ${reserves[0]} / ${reserves[1]}`);
  });
