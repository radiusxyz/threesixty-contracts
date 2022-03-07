import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

// Reference:  https://ethtx.info/0xf4fa7b8764954d1ae3d3c87aa73e47f8d9ab2e0e6eaeac52335d31451eda694b/
task("routher:addLiquidity", "")
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
  .addParam("amountADesired", "", 10, types.int)
  .addParam("amountBDesired", "", 10, types.int)
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

    let { amountADesired, amountBDesired, amountAMin, amountBMin } = args;
    const decimal = BigNumber.from(10).pow(18);
    amountADesired = BigNumber.from(amountADesired).mul(decimal).toString();
    amountBDesired = BigNumber.from(amountBDesired).mul(decimal).toString();
    amountAMin = BigNumber.from(amountAMin).mul(decimal).toString();
    amountBMin = BigNumber.from(amountBMin).mul(decimal).toString();

    const UniswapV2Router02 = await hre.ethers.getContractFactory(
      "UniswapV2Router02"
    );
    const uniswapV2Router02 = await UniswapV2Router02.attach(
      routerContractAddress
    );

    const ERC20 = await hre.ethers.getContractFactory("WETH9");
    const aToken = await ERC20.attach(aTokenContractAddress);
    const bToken = await ERC20.attach(bTokenContractAddress);

    const aTokenName = await aToken.name();
    const bTokenName = await bToken.name();

    // Approve tokens
    let result = await aToken.approve(routerContractAddress, amountADesired);
    let receipt = await result.wait();
    result = await bToken.approve(routerContractAddress, amountBDesired);
    receipt = await result.wait();

    console.log(`Sener address is ${senderAddress}`);
    console.log(`${aTokenName} contract address is ${aToken.address}`);
    console.log(`${bTokenName} contract address is ${bToken.address}`);

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

    result = await uniswapV2Router02.addLiquidity(
      aTokenContractAddress,
      bTokenContractAddress,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      senderAddress,
      deadline
    );
    receipt = await result.wait();

    const factoryContractAddress = await uniswapV2Router02.factory();
    console.log(`factoryContractAddress: ${factoryContractAddress}`);

    const UniswapV2Factory = await hre.ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const uniswapV2Factory = await UniswapV2Factory.attach(
      factoryContractAddress
    );
    const pairContractAddress = await uniswapV2Factory.getPair(
      aTokenContractAddress,
      bTokenContractAddress
    );

    const UniswapV2Pair = await hre.ethers.getContractFactory("UniswapV2Pair");
    const uniswapV2Pair = await UniswapV2Pair.attach(pairContractAddress);

    const reserves = await uniswapV2Pair.getReserves();
    console.log(`Reserve ${reserves[0]} / ${reserves[1]}`);
    // console.log(receipt);
  });

// function hex_to_ascii(str1: any) {
//   const hex = str1.toString();
//   let str = "";
//   for (let n = 0; n < hex.length; n += 2) {
//     str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
//   }
//   return str;
// }

// // const receipt = await result.wait();
//     // console.log(result);

//     const provider = new providers.JsonRpcProvider(process.env.FORMULA_L2_URL);

//     const tx: any = await provider.getTransaction(result.hash);
//     if (!tx) {
//       console.log("tx not found");
//     } else {
//       console.log(tx);
//       const code = await provider.call(result, result.blockNumber);
//       const reason = hex_to_ascii(code.substr(138));
//       console.log("revert reason:", reason);
//     }
