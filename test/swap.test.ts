import { ethers } from "hardhat";

describe("Threesixty", function () {
  it("Threesixty swap test", async function () {
    const chainId = 80001;
    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
    const accounts = await ethers.getSigners();
    const operator = accounts[0];
    const operatorAddress = accounts[0].address;

    // generate user info
    const clients = [];
    const userCount = 5;
    for (let i = 1; i <= userCount; i++) {
      clients[i] = {
        signer: accounts[i],
        address: accounts[i].address,
      };
    }

    // generate dummy backer
    // const Backer = await ethers.getContractFactory("Backer");
    // const backer = await Backer.deploy(NULL_ADDRESS);
    // await backer.deployed();
    // console.log("Backer deployed to:", backer.address);

    // generate WETH
    const TestERC20Factory = await ethers.getContractFactory("TestERC20");
    const wethContract = await TestERC20Factory.deploy(
      "Wrapped Ether",
      "WETH",
      ethers.utils.parseUnits("1000000", 18)
    );
    await wethContract.deployed();
    console.log("wethContract is deployed", wethContract.address);

    const middleTokenContract = await TestERC20Factory.deploy(
      "Middle Token",
      "MT",
      ethers.utils.parseUnits("1000000", 18)
    );
    await middleTokenContract.deployed();
    console.log("middleTokenContract is deployed", middleTokenContract.address);

    // generate vault
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(middleTokenContract.address);
    await vault.deployed();
    console.log("Vault deployed to:", vault.address);

    // generate vault
    const Mimc = await ethers.getContractFactory(
      "contracts/test/Mimc.sol:Mimc"
    );
    const mimc = await Mimc.deploy();
    await mimc.deployed();
    console.log("mimc deployed to:", mimc.address);

    // generate uniswap factory
    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const uniswapV2Factory = await UniswapV2Factory.deploy(operatorAddress);
    await uniswapV2Factory.deployed();
    console.log("uniswapV2Factory is deployed", uniswapV2Factory.address);

    // generate uniswap router
    const UniswapV2Router02 = await ethers.getContractFactory(
      "UniswapV2Router02"
    );
    const uniswapV2Router02 = await UniswapV2Router02.deploy(
      uniswapV2Factory.address,
      wethContract.address
    );
    await uniswapV2Router02.deployed();
    console.log("uniswapV2Router02 is deployed", uniswapV2Router02.address);

    // generate threesixtyRouter02
    const ThreesixtyRouter02 = await ethers.getContractFactory(
      "ThreesixtyRouter02"
    );
    const threesixtyRouter02 = await ThreesixtyRouter02.deploy(
      chainId,
      vault.address,
      uniswapV2Factory.address,
      wethContract.address,
      operatorAddress,
      operatorAddress,
      NULL_ADDRESS,
      ethers.utils.parseUnits("0.01", 6),
      {
        gasLimit: 10000000,
      }
    );
    await threesixtyRouter02.deployed();
    console.log("threesixtyRouter02 is deployed", threesixtyRouter02.address);

    // set operator & feeTo & middle token address
    const setOperatorTx = await threesixtyRouter02.setOperator(operatorAddress);
    await setOperatorTx.wait();

    const setFeeToTx = await threesixtyRouter02.setFeeTo(operatorAddress);
    await setFeeToTx.wait();

    const setMiddleAddressTx = await threesixtyRouter02
      .connect(operator)
      .setMiddleAddress(middleTokenContract.address);
    await setMiddleAddressTx.wait();

    const Recorder = await ethers.getContractFactory("Recorder");
    const recorder = await Recorder.attach(await threesixtyRouter02.recorder());
    console.log("Recorder deployed to:", recorder.address);

    const setRouterTx = await vault.setRouter(threesixtyRouter02.address);
    await setRouterTx.wait();

    const approveTx = await middleTokenContract.approve(
      vault.address,
      ethers.utils.parseUnits("0.2", 6)
    );
    await approveTx.wait();

    const depositTx = await vault.deposit(ethers.utils.parseUnits("0.2", 6));
    await depositTx.wait();

    console.log("Operator: ", await threesixtyRouter02.operator());
    console.log("MiddleToken: ", await threesixtyRouter02.middleAddress());
    console.log(
      "Vault has %d middleToken",
      await middleTokenContract.balanceOf(vault.address)
    );

    // generate A token
    let aTokenContract = await TestERC20Factory.deploy(
      "A token",
      "A_TOKEN",
      ethers.utils.parseUnits("1000000", 18)
    );
    await aTokenContract.deployed();
    console.log("aTokenContract is deployed", aTokenContract.address);

    // generate B token
    const bTokenContract = await TestERC20Factory.deploy(
      "B token",
      "B_TOKEN",
      ethers.utils.parseUnits("1000000", 18)
    );
    await bTokenContract.deployed();
    console.log("bTokenContract is deployed", bTokenContract.address);

    console.log(`------------------------------------------------------------`);
    console.log(``);

    // approve A token
    const approveATokenResult = await aTokenContract.approve(
      uniswapV2Router02.address,
      ethers.utils.parseUnits("1000000", 18)
    );
    await approveATokenResult.wait();

    // approve B token
    const approveBTokenResult = await bTokenContract.approve(
      uniswapV2Router02.address,
      ethers.utils.parseUnits("1000000", 18)
    );
    await approveBTokenResult.wait();

    // approve middle token
    const approveMiddleTokenResult = await middleTokenContract.approve(
      uniswapV2Router02.address,
      ethers.utils.parseUnits("1000000", 18)
    );
    await approveMiddleTokenResult.wait();

    const addLiquidityABResult = await uniswapV2Router02.addLiquidity(
      aTokenContract.address,
      bTokenContract.address,
      ethers.utils.parseUnits("500", 18),
      ethers.utils.parseUnits("500", 18),
      "0",
      "0",
      operatorAddress,
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2
    );
    await addLiquidityABResult.wait();

    const addLiquidityAMiddleResult = await uniswapV2Router02.addLiquidity(
      aTokenContract.address,
      middleTokenContract.address,
      ethers.utils.parseUnits("500", 18),
      ethers.utils.parseUnits("500", 18),
      "0",
      "0",
      operatorAddress,
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2
    );
    await addLiquidityAMiddleResult.wait();

    const addLiquidityBMiddleResult = await uniswapV2Router02.addLiquidity(
      bTokenContract.address,
      middleTokenContract.address,
      ethers.utils.parseUnits("500", 18),
      ethers.utils.parseUnits("500", 18),
      "0",
      "0",
      operatorAddress,
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2
    );
    await addLiquidityBMiddleResult.wait();

    // get A-B pair
    const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");
    const aBPairContract = UniswapV2Pair.attach(
      await uniswapV2Factory.getPair(
        aTokenContract.address,
        bTokenContract.address
      )
    );

    let reserves = await aBPairContract.getReserves();
    console.log(`Pair: ${aBPairContract.address}`);
    console.log(`${reserves[0].toString()} / ${reserves[1].toString()}`);

    // get A-Middle pair
    const aMiddlePairContract = UniswapV2Pair.attach(
      await uniswapV2Factory.getPair(
        aTokenContract.address,
        middleTokenContract.address
      )
    );

    reserves = await aMiddlePairContract.getReserves();
    console.log(`Pair: ${aMiddlePairContract.address}`);
    console.log(`${reserves[0].toString()} / ${reserves[1].toString()}`);

    // get B-Middle pair
    const bMiddlePairContract = UniswapV2Pair.attach(
      await uniswapV2Factory.getPair(
        bTokenContract.address,
        middleTokenContract.address
      )
    );

    reserves = await bMiddlePairContract.getReserves();
    console.log(`Pair: ${bMiddlePairContract.address}`);
    console.log(`${reserves[0].toString()} / ${reserves[1].toString()}`);

    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];
      const transferResult = await aTokenContract
        .connect(operator)
        .transfer(client.address, ethers.utils.parseUnits("500", 18));
      await transferResult.wait();

      if (i !== 2) {
        aTokenContract = await aTokenContract.connect(client.signer);
        const approveResult = await aTokenContract.approve(
          threesixtyRouter02.address,
          ethers.utils.parseUnits("1000000", 18)
        );
        await approveResult.wait();
      }
    }

    console.log(``);
    console.log(`${await aTokenContract.name()} allowance ------------------`);
    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];
      const aTokenBalance = await aTokenContract.allowance(
        client.address,
        threesixtyRouter02.address
      );

      console.log(client.address, aTokenBalance.toString());
    }
    console.log(`------------------------------------------------------------`);
    console.log(``);

    let txHashes: any = [];
    let txs: any = [];
    let rs: any = [];
    let ss: any = [];
    let vs: any = [];

    let txOrderMsg: any;
    let operatorSig: any;
    let claimTx: any;
    let proofHash =
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];

      const tx = {
        amountIn: "100000000000000",
        amountOut: "0",
        availableFrom: 1575736372,
        backerIntegrity: false,
        deadline: 2068845350,
        functionSelector: "0x73a2cff1",
        nonce: "0",
        path: [aTokenContract.address, bTokenContract.address],
        to: client.address,
        txOwner: client.address,
      };

      const mimcHash = await mimc.hash(
        tx.txOwner,
        tx.functionSelector,
        tx.amountIn,
        tx.amountOut,
        tx.path,
        tx.to,
        tx.nonce,
        tx.deadline
      );

      const typedData = {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          Swap: [
            { name: "txOwner", type: "address" },
            { name: "functionSelector", type: "bytes4" },
            { name: "amountIn", type: "uint256" },
            { name: "amountOut", type: "uint256" },
            { name: "path", type: "address[]" },
            { name: "to", type: "address" },
            { name: "nonce", type: "uint256" },
            { name: "backerIntegrity", type: "bool" },
            { name: "availableFrom", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Swap",
        domain: {
          name: "Threesixty swap",
          version: "1",
          chainId: chainId,
          verifyingContract: threesixtyRouter02.address,
        },
      };

      const txHash = ethers.utils._TypedDataEncoder.hash(
        typedData.domain,
        { Swap: typedData.types.Swap },
        tx
      );

      const signatureHex = await client.signer._signTypedData(
        typedData.domain,
        { Swap: typedData.types.Swap },
        tx
      );

      const userSig = ethers.utils.splitSignature(signatureHex);

      if (i == 3) {
        const userRecorderContract = recorder.connect(client.signer);

        const cancelTxIdResult = await userRecorderContract.disableTxHash(
          txHash
        );
        await cancelTxIdResult.wait();
      }

      proofHash = ethers.utils.solidityKeccak256(
        ["bytes32", "bytes32"],
        [proofHash, txHash]
      );

      txHashes.push(txHash);
      txs.push(tx);
      rs.push(userSig.r);
      ss.push(userSig.s);
      vs.push(userSig.v);
    }

    txHashes = txHashes.reverse();

    const addTxIdsResult = await recorder.addTxHashes(txHashes);
    await addTxIdsResult.wait();

    txs = txs.reverse();
    vs = vs.reverse();
    rs = rs.reverse();
    ss = ss.reverse();

    const batchSwapResult = await threesixtyRouter02.batchSwap(
      txs,
      vs,
      rs,
      ss,
      {
        gasLimit: 10000000,
      }
    );
    await batchSwapResult.wait();

    console.log(`${await aTokenContract.name()} balances ------------------`);
    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];
      const aTokenBalance = await aTokenContract.balanceOf(client.address);

      console.log(client.address, aTokenBalance.toString());
    }
    console.log(`------------------------------------------------------------`);
    console.log(``);

    console.log(`${await bTokenContract.name()} balances ------------------`);
    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];
      const bTokenBalance = await bTokenContract.balanceOf(client.address);

      if (i === 2) {
        console.log(
          client.address,
          bTokenBalance.toString(),
          "Not enough allowance"
        );
      } else if (i == 3) {
        console.log(client.address, bTokenBalance.toString(), "Cancel tx");
      } else {
        console.log(client.address, bTokenBalance.toString());
      }
    }
    console.log(`------------------------------------------------------------`);
    console.log(``);
  });
});
