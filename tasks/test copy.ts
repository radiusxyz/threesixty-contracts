import { task } from "hardhat/config";
import * as types from "hardhat/internal/core/params/argumentTypes";
import { BigNumber } from "@ethersproject/bignumber";

task("tt", "")
  .addParam(
    "contractAddress",
    "",
    process.env.TEST_CONTRACT_ADDRESS,
    types.string
  )
  .setAction(async (args, hre: any) => {
    const WETH9 = await hre.ethers.getContractFactory("WETH9");
    const wETH9 = await WETH9.attach(
      "0x359570B3a0437805D0a71457D61AD26a28cAC9A2"
    );

    console.log("");
    console.log(
      `Balance of ${process.env.ADDRESS}`,
      `${await wETH9.balanceOf(process.env.ADDRESS)}`
    );
    console.log(
      `Balance of ${process.env.TOKEN_PAIR_CONTRACT_ADDRESS}`,
      `${await wETH9.balanceOf(process.env.TOKEN_PAIR_CONTRACT_ADDRESS)}`
    );

    // ----------
    const { contractAddress } = args;

    const Tester = await hre.ethers.getContractFactory("Tester");
    const testContract = await Tester.attach(contractAddress);

    const pairAddress = await testContract.getPair(
      process.env.FACTORY_CONTRACT_ADDRESS,
      process.env.ERC20_CONTRACT_ADDRESS,
      process.env.ERC20_CONTRACT_ADDRESS2
    );
    console.log("Pair address: ", pairAddress);

    // const result: any = await testContract.test6(
    //   "0x359570B3a0437805D0a71457D61AD26a28cAC9A2",
    //   pairAddress,
    //   10
    // );

    let result: any = await wETH9.approve(process.env.ADDRESS, 10);
    let receipt = await result.wait();

    console.log("aaa");
    result = await wETH9.transferFrom(
      process.env.ADDRESS,
      process.env.TOKEN_PAIR_CONTRACT_ADDRESS,
      10
    );
    // const result: any = await wETH9.transfer(
    //   process.env.TOKEN_PAIR_CONTRACT_ADDRESS,
    //   10
    // );
    // const receipt = await result.wait();
    receipt = await result.wait();

    console.log("");
    console.log(
      `Balance of ${process.env.ADDRESS}`,
      `${await wETH9.balanceOf(process.env.ADDRESS)}`
    );
    console.log(
      `Balance of ${process.env.TOKEN_PAIR_CONTRACT_ADDRESS}`,
      `${await wETH9.balanceOf(process.env.TOKEN_PAIR_CONTRACT_ADDRESS)}`
    );

    return;

    console.log("contractAddress: ", contractAddress);

    console.log(
      "Test result: ",
      await testContract.test2(
        process.env.FACTORY_CONTRACT_ADDRESS,
        process.env.ERC20_CONTRACT_ADDRESS,
        process.env.ERC20_CONTRACT_ADDRESS2
      )
    );

    // console.log("Test result: ", await testContract.test3());
    // console.log("Test result: ", await testContract.test4());
    // console.log("Test result: ", await testContract.test5());
  });
