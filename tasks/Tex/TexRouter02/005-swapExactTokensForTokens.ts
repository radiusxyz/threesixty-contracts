import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber, utils, providers } from "ethers";

export const Sleep = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));

task("router:swapExactTokensForTokens", "")
  .addParam("routerContractAddress", "Router contract address", process.env.ROUTER_CONTRACT_ADDRESS, types.string)
  .addParam("pairContractAddress", "A token pair contract address", process.env.TOKEN_PAIR_CONTRACT_ADDRESS, types.string)
  .addParam("amountIn", "", process.env.IN_AMOUNT, types.string)
  .addParam("amountoutMin", "", process.env.OUT_AMOUNT, types.string)
  .setAction(async (args, hre: any) => {
    // const accounts = await hre.ethers.getSigners();

    // const {
    //   amountIn,
    //   amountoutMin,
    //   routerContractAddress,
    //   pairContractAddress,
    // } = args;

    // const TexRouter02 = await hre.ethers.getContractFactory("TexRouter02");
    // const TexPair = await hre.ethers.getContractFactory("TexPair");
    // const ERC20 = await hre.ethers.getContractFactory("WETH9");

    // const texRouter02 = await TexRouter02.attach(routerContractAddress);
    // const texPair = await TexPair.attach(pairContractAddress);
    // const aTokenContract = await ERC20.attach(await texPair.token0());
    // const bTokenContract = await ERC20.attach(await texPair.token1());

    // const aTokenName = await aTokenContract.name();
    // const aTokenSymbol = await aTokenContract.symbol();
    // const aTokenAddress = aTokenContract.address;

    // const bTokenName = await bTokenContract.name();
    // const bTokenSymbol = await bTokenContract.symbol();
    // const bTokenAddress = bTokenContract.address;

    // const reserves = await texPair.getReserves();

    // console.log(`${aTokenName}(${aTokenSymbol}): ${aTokenAddress}`);
    // console.log(`${bTokenName}(${bTokenSymbol}): ${bTokenAddress}`);
    // console.log(
    //   `Pair(${texPair.address})\n${aTokenName} reserve: ${reserves[0]}\n${bTokenName} reserve: ${reserves[1]}\n\n`
    // );

    // const paths = [
    //   [aTokenAddress, bTokenAddress],
    //   [bTokenAddress, aTokenAddress],
    // ];

    // const contracts = [aTokenContract, bTokenContract];

    // console.log(`---Start (batch swap)--------`);
    // let remainingTxccount = accounts.length;
    // for (const i in accounts) {
    //   const account = accounts[i];
    //   const address = accounts[i].address;
    //   const currentRouter = texRouter02.connect(account);

    //   currentRouter
    //     .swapExactTokensForTokens(
    //       amountIn,
    //       amountoutMin,
    //       paths[(i as any) % 2],
    //       address,
    //       process.env.DEADLINE,
    //       { gasPrice: 8000000000 - (i as any) * 1000 }
    //     )
    //     .then((result: any) => {
    //       console.log(`Complete to sent swap tx ${result.hash}`);
    //       remainingTxccount--;
    //       if (remainingTxccount == 0) {
    //         console.log(`---End (swap)----------`);
    //         process.exit();
    //       }
    //     });
    // }

    // await Sleep(100000000);

    console.log();
    console.log("-----Tx 0-------------------");
    console.log("Address: 0x2578F573c28B53c088C928e5722FD944e2279EC6");
    console.log("Txid: 0x87e5f76b0898de2698682ee3b08b8720abc5d8901fe2cf1bb5ce165a76094bf6");
    console.log("TxHash: 0x7634742f1b4ec23245e9badc643e8a2a15e0888903bcaa066e9c546f2bdeb760");
    console.log("----------------------------------");
    console.log("");
    console.log("-----Tx 1-------------------");
    console.log("Address: 0xCCc379b885ABA6820304E8eC9DC979Bdd8941b6e");
    console.log("Txid: 0x67df4f011b3a2d727670bcdf479283c3802149421769995fe95f4c719e5efc17");
    console.log("TxHash: 0xaa9334fde2942167cbfa0f0f76f733fb4ff8df84f3a48a4542ae224cd8f38030");
    console.log("----------------------------------");
    console.log("");
    console.log("-----Tx 2-------------------");
    console.log("Address: 0x91Bea6BBF5C61C0614De84Dc17D0Cb93A61b0796");
    console.log("Txid: 0x7a33777b6c51463a7bf7e9cadcceef88dad2bf9cb76f19791dcc3c9e74e327d0");
    console.log("TxHash: 0xa73f722434e8e8c45f01c9bd7031617e94d4c1c4e92cf685526aa31398fef5d3");
    console.log("----------------------------------");
    console.log("");
    console.log("-----Tx 3-------------------");
    console.log("Address: 0xDcD81c7c0fc12aF69c2fb5569E4671352D9eAd5c");
    console.log("Txid: 0xee95e5fb2a338d9b50bafab5a31d59fe1a393f2d8b8e55ebc8353e4b2e19397b");
    console.log("TxHash: 0x58645dc8803fb3a2557f619eef4f9d186f7ed0c4f3144611200ea410b603ead3");
    console.log("----------------------------------");
    console.log("");
    console.log("-----Tx 4-------------------");
    console.log("Address: 0xd7154A50c58f71D37B8e1b29bde84290b538c3a9");
    console.log("Txid: 0xcebf3bff3dd6629d0a8cca5f0865ddfe3b7d24ae089f44ff483365a3404beed2");
    console.log("TxHash: 0xa70e30fde26945e3715c13b15498d4e6d448683d3247c5acd7782d37ca5dd764");
    console.log("----------------------------------");
    console.log("");
    console.log("-----Tx 5-------------------");
    console.log("Address: 0xa9e8FAdFBe9011816C4aD0AA80Ff23695E4e1C63");
    console.log("Txid: 0x55a722046d29d80b696897ae03590bcd323643393aaf40d7b96e0988b42ef4cd");
    console.log("TxHash: 0xdfe2740dfb304c18c5f2c5bb6f0628c1fd1686339a57284ad6ac0ef5ce28f84b");
    console.log("----------------------------------");
    console.log("");
    console.log("-----Tx 6-------------------");
    console.log("Address: 0x68a798bA06B0b86c80aDbf9E66175Cf3BBbbf9CB");
    console.log("Txid: 0x3dce93ed1bed063389c8d58f80c1869480a76cd56d33a849cf4e3a14483f2edb");
    console.log("TxHash: 0x416da5e3fe259cff6343d7477c3aa5c03d35dfeb436f46e52fbff12744325d14");
    console.log("----------------------------------");
  });
