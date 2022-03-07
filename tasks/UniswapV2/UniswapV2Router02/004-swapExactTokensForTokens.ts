import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

task("routher:swapExactTokensForTokens", "")
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

    const UniswapV2Router02 = await hre.ethers.getContractFactory(
      "UniswapV2Router02"
    );
    const uniswapV2Router02 = await UniswapV2Router02.attach(
      routerContractAddress
    );

    const UniswapV2Pair = await hre.ethers.getContractFactory("UniswapV2Pair");
    const uniswapV2Pair = await UniswapV2Pair.attach(pairContractAddress);

    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const aTokenContract = await WETH9.attach(await uniswapV2Pair.token0());
    const bTokenContract = await WETH9.attach(await uniswapV2Pair.token1());

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

    result = await uniswapV2Router02.swapExactTokensForTokens(
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

    const reserves = await uniswapV2Pair.getReserves();
    console.log(`Reserve ${reserves[0]} / ${reserves[1]}`);
  });
