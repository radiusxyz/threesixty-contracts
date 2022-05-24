import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "@ethersproject/bignumber";

task("mint", "Mint")
  .addParam(
    "pairContractAddress",
    "Token pair contract address",
    process.env.TOKEN_PAIR_CONTRACT_ADDRESS,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const [from, to] = await hre.ethers.getSigners();
    const fromAddress = from.address;
    const toAddress = to.address;
    const { pairContractAddress, amount } = args;

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const fswapPair = await TexPair.attach(pairContractAddress);

    const ERC20 = await hre.ethers.getContractFactory("WETH9");
    const aTokenContract = await ERC20.attach(await fswapPair.token0());
    const bTokenContract = await ERC20.attach(await fswapPair.token1());

    console.log("aTokenContractAddress: ", aTokenContract.address);
    console.log("bTokenContractAddress: ", bTokenContract.address);
    console.log("");

    console.log("Before mint------------------------------------------------");
    console.log("totalSupply: ", await fswapPair.totalSupply());
    console.log("balance: ", await fswapPair.balanceOf(fromAddress));
    console.log(
      "aToken balance: ",
      await aTokenContract.balanceOf(fswapPair.address)
    );
    console.log(
      "bToken balance: ",
      await bTokenContract.balanceOf(fswapPair.address)
    );
    let reserves = await fswapPair.getReserves();
    console.log("aToken reserve: ", reserves[0]);
    console.log("bToken reserve: ", reserves[1]);
    console.log("------------------------------------------------------------");

    await aTokenContract.transfer(
      fswapPair.address,
      BigNumber.from(1).mul(BigNumber.from(10).pow(18))
    );
    await bTokenContract.transfer(
      fswapPair.address,
      BigNumber.from(4).mul(BigNumber.from(10).pow(18))
    );
    const result = await fswapPair.mint(fromAddress, { gasLimit: 9999999 });

    console.log("After mint--------------------------------------------------");
    console.log("totalSupply: ", await fswapPair.totalSupply());
    console.log("balance: ", await fswapPair.balanceOf(fromAddress));
    console.log(
      "aToken balance: ",
      await aTokenContract.balanceOf(fswapPair.address)
    );
    console.log(
      "bToken balance: ",
      await bTokenContract.balanceOf(fswapPair.address)
    );
    reserves = await fswapPair.getReserves();
    console.log("aToken reserve: ", reserves[0]);
    console.log("bToken reserve: ", reserves[1]);
    console.log("------------------------------------------------------------");
  });
