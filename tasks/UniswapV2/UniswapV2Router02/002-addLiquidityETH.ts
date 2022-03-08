import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

const overrides = {
  gasLimit: 9999999,
};

// Reference:  https://ethtx.info/0xf4fa7b8764954d1ae3d3c87aa73e47f8d9ab2e0e6eaeac52335d31451eda694b/
task("router:addLiquidityETH", "")
  .addParam(
    "routerContractAddress",
    "Router contract address",
    process.env.ROUTER_CONTRACT_ADDRESS,
    types.string
  )
  .addParam(
    "tokenContractAddress",
    "Token contract address",
    process.env.ERC20_CONTRACT_ADDRESS,
    types.string
  )
  .addParam("amountTokenDesired", "", 10, types.int)
  .addParam("amountTokenMin", "", 1, types.int)
  .setAction(async (args, hre: any) => {
    const [sender] = await hre.ethers.getSigners();
    const senderAddress = sender.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2; // 2 days
    const { routerContractAddress, tokenContractAddress } = args;

    let { amountTokenDesired, amountTokenMin } = args;
    const decimal = BigNumber.from(10).pow(18);
    amountTokenDesired = BigNumber.from(amountTokenDesired)
      .mul(decimal)
      .toString();
    amountTokenMin = BigNumber.from(amountTokenMin).mul(decimal).toString();
    const amountETH = BigNumber.from(1).mul(decimal).toString();

    const UniswapV2Router02 = await hre.ethers.getContractFactory(
      "UniswapV2Router02"
    );
    const uniswapV2Router02 = await UniswapV2Router02.attach(
      routerContractAddress
    );

    const ERC20 = await hre.ethers.getContractFactory("WETH9");
    const wETHContractAddress = await uniswapV2Router02.WETH();
    const token = await ERC20.attach(tokenContractAddress);
    const wETH = await ERC20.attach(wETHContractAddress);

    const tokenName = await token.name();
    const wETHName = await wETH.name();

    // Approve tokens
    let result = await token.approve(routerContractAddress, amountTokenDesired);
    let receipt = await result.wait();

    console.log(`Sener address is ${senderAddress}`);
    console.log(`${tokenName} contract address is ${token.address}`);
    console.log(`${wETHName} contract address is ${wETH.address}`);

    console.log(
      `${tokenName} balance is ${await token.balanceOf(senderAddress)}`
    );
    console.log(
      `${tokenName} allowance is ${await token.allowance(
        senderAddress,
        senderAddress
      )}`
    );
    console.log();

    console.log(
      `${wETHName} balance is ${await wETH.balanceOf(senderAddress)}`
    );
    console.log(
      `${wETHName} allowance is ${await wETH.allowance(
        senderAddress,
        senderAddress
      )}`
    );
    console.log();

    result = await uniswapV2Router02.addLiquidityETH(
      tokenContractAddress,
      amountTokenDesired,
      amountTokenMin,
      amountETH,
      senderAddress,
      deadline,
      {
        ...overrides,
        value: amountETH,
      }
    );
    receipt = await result.wait();
    console.log(receipt);

    const factoryContractAddress = await uniswapV2Router02.factory();
    console.log(`factoryContractAddress: ${factoryContractAddress}`);

    const UniswapV2Factory = await hre.ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const uniswapV2Factory = await UniswapV2Factory.attach(
      factoryContractAddress
    );
    const pairContractAddress = await uniswapV2Factory.getPair(
      wETHContractAddress,
      tokenContractAddress
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
