import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

// Reference:  https://ethtx.info/0xf4fa7b8764954d1ae3d3c87aa73e47f8d9ab2e0e6eaeac52335d31451eda694b/
task("router:removeLiquidity", "")
  .addParam(
    "routerContractAddress",
    "Router contract address",
    process.env.ROUTER_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "aTokenContractAddress",
    "A token contract address",
    process.env.ERC20_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "bTokenContractAddress",
    "B token contract address",
    process.env.ERC20_CONTRACT_ADDRESS2,
    types.string
  )
  .addParam("amountAMin", "", 1, types.int)
  .addParam("amountBMin", "", 1, types.int)
  .setAction(async (args, hre: any) => {
    const [sender] = await hre.ethers.getSigners();
    const senderAddress = sender.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2; // 2 days
    const {
      routerContractAddress,
      aTokenContractAddress,
      bTokenContractAddress,
    } = args;

    let { amountAMin, amountBMin } = args;
    const decimal = BigNumber.from(10).pow(18);
    amountAMin = BigNumber.from(amountAMin).mul(decimal).toString();
    amountBMin = BigNumber.from(amountBMin).mul(decimal).toString();

    const TexRouter02 = await hre.ethers.getContractFactory("TexRouter02");
    const fswapRouter02 = await TexRouter02.attach(routerContractAddress);

    const ERC20 = await hre.ethers.getContractFactory("WETH9");
    const aToken = await ERC20.attach(aTokenContractAddress);
    const bToken = await ERC20.attach(bTokenContractAddress);

    const aTokenName = await aToken.name();
    const bTokenName = await bToken.name();

    console.log(`Sener address is ${senderAddress}`);
    console.log(`${aTokenName} contract address is ${aToken.address}`);
    console.log(`${bTokenName} contract address is ${bToken.address}`);

    const factoryContractAddress = await fswapRouter02.factory();
    console.log(`factoryContractAddress: ${factoryContractAddress}`);

    const TexFactory = await hre.ethers.getContractFactory("TexFactory");
    const fswapFactory = await TexFactory.attach(factoryContractAddress);
    const pairContractAddress = await fswapFactory.getPair(
      aTokenContractAddress,
      bTokenContractAddress
    );

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const fswapPair = await TexPair.attach(pairContractAddress);

    const aTokenInPair = await aToken.balanceOf(pairContractAddress);
    const bTokenInPair = await bToken.balanceOf(pairContractAddress);
    const liquidity = await fswapPair.balanceOf(senderAddress);
    const totalSupply = await fswapPair.totalSupply();
    const NaiveATokenExpected = aTokenInPair.mul(liquidity).div(totalSupply);
    const BTokenExpected = bTokenInPair.mul(liquidity).div(totalSupply);

    const result1 = await fswapPair.approve(routerContractAddress, liquidity);
    const receipt1 = await result1.wait();

    const result = await fswapRouter02.removeLiquidity(
      aTokenContractAddress,
      bTokenContractAddress,
      liquidity,
      NaiveATokenExpected,
      BTokenExpected,
      senderAddress,
      deadline
    );
    const receipt = await result.wait();

    const reserves = await fswapPair.getReserves();
    console.log(`Reserve ${reserves[0]} / ${reserves[1]}`);

    console.log();

    console.log(
      `${aTokenName} balance is ${await aToken.balanceOf(senderAddress)}`
    );
    console.log(
      `${aTokenName} allowance is ${await aToken.allowance(
        senderAddress,
        senderAddress
      )}`
    );
    console.log();

    console.log(
      `${bTokenName} balance is ${await bToken.balanceOf(senderAddress)}`
    );
    console.log(
      `${bTokenName} allowance is ${await bToken.allowance(
        senderAddress,
        senderAddress
      )}`
    );
    console.log();
  });
