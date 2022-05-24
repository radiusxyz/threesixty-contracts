import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

// Reference:  https://ethtx.info/0xf4fa7b8764954d1ae3d3c87aa73e47f8d9ab2e0e6eaeac52335d31451eda694b/
task("router:addLiquidity", "")
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
  .addParam("amountADesired", "", 1000, types.int)
  .addParam("amountBDesired", "", 1000, types.int)
  .addParam("amountAMin", "", 1000, types.int)
  .addParam("amountBMin", "", 1000, types.int)
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

    console.log("amountADesired", amountADesired);
    console.log("amountBDesired", amountBDesired);
    console.log("amountAMin", amountAMin);
    console.log("amountBMin", amountBMin);

    const TexRouter02 = await hre.ethers.getContractFactory("TexRouter02");
    const texRouter02 = await TexRouter02.attach(routerContractAddress);

    const ERC20 = await hre.ethers.getContractFactory("WETH9");
    const aTokenContract = await ERC20.attach(aTokenContractAddress);
    const bTokenContract = await ERC20.attach(bTokenContractAddress);

    const aTokenName = await aTokenContract.name();
    const aTokenSymbol = await aTokenContract.symbol();
    const aTokenDecimals = await aTokenContract.decimals();
    const aTokenAddress = aTokenContract.address;

    const bTokenName = await bTokenContract.name();
    const bTokenSymbol = await bTokenContract.symbol();
    const bTokenDecimals = await bTokenContract.decimals();
    const bTokenAddress = bTokenContract.address;

    console.log(`Sener address is ${senderAddress}`);
    console.log(`Router address is ${routerContractAddress}`);
    console.log(
      `${aTokenName}(${aTokenSymbol}): ${aTokenAddress} / decimals: ${aTokenDecimals}`
    );
    console.log(
      `${bTokenName}(${bTokenSymbol}): ${bTokenAddress} / decimals: ${bTokenDecimals}`
    );

    // Approve tokens
    let result = await aTokenContract.approve(
      routerContractAddress,
      amountADesired
    );
    let receipt = await result.wait();

    result = await bTokenContract.approve(
      routerContractAddress,
      amountBDesired
    );
    receipt = await result.wait();

    console.log(
      `${aTokenName} balance is ${await aTokenContract.balanceOf(
        senderAddress
      )}`
    );
    console.log(
      `${aTokenName} allowance is ${await aTokenContract.allowance(
        senderAddress,
        routerContractAddress
      )}`
    );
    console.log();

    console.log(
      `${bTokenName} balance is ${await bTokenContract.balanceOf(
        senderAddress
      )}`
    );
    console.log(
      `${bTokenName} allowance is ${await bTokenContract.allowance(
        senderAddress,
        routerContractAddress
      )}`
    );
    console.log();

    result = await texRouter02.addLiquidity(
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

    const factoryContractAddress = await texRouter02.factory();
    console.log(`factoryContractAddress: ${factoryContractAddress}`);

    const TexFactory = await hre.ethers.getContractFactory("TexFactory");
    const texFactory = await TexFactory.attach(factoryContractAddress);
    const pairContractAddress = await texFactory.getPair(
      aTokenContractAddress,
      bTokenContractAddress
    );

    const TexPair = await hre.ethers.getContractFactory("TexPair");
    const texPair = await TexPair.attach(pairContractAddress);

    const reserves = await texPair.getReserves();
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
