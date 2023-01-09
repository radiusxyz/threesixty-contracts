import { expect } from "chai";
import { ethers } from "hardhat";
import { _TypedDataEncoder as typedDataEncoder } from "@ethersproject/hash";

describe("three-sixty", function () {
  it("three-sixty test", async function () {
    const chainId = 80001;
    const backerAddress = "0x5757371414417b8c6caad45baef941abc7d3ab32";

    const accounts = await ethers.getSigners();
    const signer = accounts[0];
    const signerAddress = accounts[0].address;

    const clients = [];
    const userCount = 16;
    for (let i = 1; i <= userCount; i++) {
      clients[i] = {
        signer: accounts[i],
        address: accounts[i].address,
      };
    }

    const TestERC20Factory = await ethers.getContractFactory("TestERC20");
    const RecorderFactory = await ethers.getContractFactory("Recorder");
    const VaultFactory = await ethers.getContractFactory("Vault");
    const MimcFactory = await ethers.getContractFactory(
      "contracts/test/Mimc.sol:Mimc"
    );
    const UniswapV2Factory = await ethers.getContractFactory(
      "UniswapV2Factory"
    );

    const UniswapV2Pair = await ethers.getContractFactory("UniswapV2Pair");

    const ThreesixtyRouter02Factory = await ethers.getContractFactory(
      "ThreesixtyRouter02"
    );

    const mimc = await MimcFactory.deploy();

    const uniswapFactoryContract = await UniswapV2Factory.deploy(signerAddress);
    await uniswapFactoryContract.deployed();
    console.log(
      `uniswapFactoryContract is deployed: ${uniswapFactoryContract.address}`
    );

    const wethContract = await TestERC20Factory.deploy(
      "Wrapped Ether",
      "WETH",
      ethers.utils.parseUnits("1000000", 18)
    );
    await wethContract.deployed();
    console.log(`wethContract is deployed: ${wethContract.address}`);

    const usdtContract = await TestERC20Factory.deploy(
      "USDT",
      "USDT",
      ethers.utils.parseUnits("1000000", 18)
    );
    await usdtContract.deployed();
    console.log(`usdtContract is deployed: ${usdtContract.address}`);


    const vaultContract = await VaultFactory.deploy(usdtContract.address);
    await vaultContract.deployed();
    console.log(`vaultContract is deployed: ${vaultContract.address}`);

    const approveUSDTContractResult = await usdtContract.approve(
      vaultContract.address,
      ethers.utils.parseUnits("1000000", 18)
    );
    await approveUSDTContractResult.wait();

    const depositResult = await vaultContract.deposit(
      ethers.utils.parseUnits("1000000", 18)
    );
    await depositResult.wait();

    const routerContract = await ThreesixtyRouter02Factory.deploy(
        chainId,
      vaultContract.address,
      uniswapFactoryContract.address,
      wethContract.address,
      signerAddress,
      signerAddress,
      backerAddress,
      ethers.utils.parseUnits("0.01", 6),
      {
        gasLimit: 30000000,
      }
    );
    await routerContract.deployed();
    console.log(`routerContract is deployed: ${routerContract.address}`);

    const recorderContract = await RecorderFactory.attach(await routerContract.recorder());

    const setRouterResult = await vaultContract.setRouter(
      routerContract.address
    );
    await setRouterResult.wait();

    let contractBalance = await ethers.provider.getBalance(
      vaultContract.address
    );

    await routerContract.setFeeTo(signerAddress);
    await routerContract.setOperator(signerAddress);

    let aTokenContract = await TestERC20Factory.deploy(
      "A token",
      "A_TOKEN",
      ethers.utils.parseUnits("1000000", 18)
    );
    await aTokenContract.deployed();
    console.log("aTokenContract is deployed", aTokenContract.address);

    const bTokenContract = await TestERC20Factory.deploy(
      "B token",
      "B_TOKEN",
      ethers.utils.parseUnits("1000000", 18)
    );
    await bTokenContract.deployed();
    console.log("bTokenContract is deployed", bTokenContract.address);

    const result = await uniswapFactoryContract.createPair(
      aTokenContract.address,
      bTokenContract.address
    );
    await result.wait();
    const pairContractAddress = await uniswapFactoryContract.getPair(
      aTokenContract.address,
      bTokenContract.address
    );
    console.log("Pair contract is deployed", pairContractAddress);

    const approveATokenResult = await aTokenContract.approve(
      routerContract.address,
      ethers.utils.parseUnits("1000000", 18)
    );
    await approveATokenResult.wait();
    // console.log(
    //   `${await aTokenContract.name()} approved (${ethers.utils.parseUnits(
    //     "1000000",
    //     18
    //   )} - from: ${signerAddress} / - to: ${routerContract.address})`
    // );

    const approveBTokenResult = await bTokenContract.approve(
      routerContract.address,
      ethers.utils.parseUnits("1000000", 18)
    );
    await approveBTokenResult.wait();
    // console.log(
    //   `${await bTokenContract.name()} approved (${ethers.utils.parseUnits(
    //     "1000000",
    //     18
    //   )} - from: ${signerAddress} / - to: ${routerContract.address})`
    // );

    console.log("Start addLiquidity.");
    const addLiquidityResult = await routerContract.addLiquidity(
      aTokenContract.address,
      bTokenContract.address,
      ethers.utils.parseUnits("500", 18),
      ethers.utils.parseUnits("500", 18),
      "0",
      "0",
      signerAddress,
      Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2
    );
    await addLiquidityResult.wait();
    console.log("Complete to addLiquidity.");

    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];

      const transferResult = await aTokenContract.transfer(
        client.address,
        ethers.utils.parseUnits("500", 18)
      );
      await transferResult.wait();
    }

    const txHashes: any = [];
    const txs: any = [];

    const rs: any = [];
    const ss: any = [];
    const vs: any = [];

    let txOrderMsg: any;
    let operatorSig: any;
    let claimTx: any;
    let proofHash =
      "0x0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];
      aTokenContract = await aTokenContract.connect(client.signer);

      if (i !== 13 && i !== 16) {
        const approveResult = await aTokenContract.approve(
          routerContract.address,
          ethers.utils.parseUnits("1000000", 18)
        );
        await approveResult.wait();
      }

      const tx = {
        txOwner: client.address,
        functionSelector: "0x375734d9",
        amountIn: "100000000000000",
        amountOut: "0",
        path: [aTokenContract.address, bTokenContract.address],
        to: client.address,
        nonce: "0",
        availableFrom: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 2,
        deadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2,
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
            { name: "availableFrom", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Swap",
        domain: {
          name: "Threesixty swap",
          version: "1",
          chainId: chainId,
          verifyingContract: routerContract.address,
        },
      };

      const txHash = typedDataEncoder.hash(
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
      const aTokenName = await aTokenContract.name();
      const aTokenBalance = await aTokenContract.balanceOf(client.address);
      const aTokenAllowance = await aTokenContract.allowance(
        client.address,
        routerContract.address
      );

      if (i == 1) {
        claimTx = JSON.parse(JSON.stringify(tx));
        const typedData = {
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            Claim: [
              { name: "round", type: "uint256" },
              { name: "order", type: "uint256" },
              { name: "mimcHash", type: "bytes32" },
              { name: "txHash", type: "bytes32" },
              { name: "proofHash", type: "bytes32" },
            ],
          },
          primaryType: "Claim",
          domain: {
            name: "Threesixty swap",
            version: "1",
            chainId: chainId,
            verifyingContract: routerContract.address,
          },
        };

        txOrderMsg = {
          round: 0,
          order: i - 1,
          mimcHash: mimcHash,
          txHash: txHash,
          proofHash: proofHash,
        };

        const signatureHex = await signer._signTypedData(
          typedData.domain,
          { Claim: typedData.types.Claim },
          txOrderMsg
        );
        operatorSig = ethers.utils.splitSignature(signatureHex);
      }

      if (i == 3) {
        console.log("Cancel", client.address);
        const userRecorderContract = RecorderFactory.connect(
          client.signer
        ).attach(await routerContract.recorder());
        console.log("txHash", txHash);

        const disableTxHashResult = await userRecorderContract.disableTxHash(
          txHash
        );
        await disableTxHashResult.wait();
      }
      txHashes.push(txHash);
      txs.push(tx);
      rs.push(userSig.r);
      ss.push(userSig.s);
      vs.push(userSig.v);

      proofHash = ethers.utils.solidityKeccak256(
        ["bytes32", "bytes32"],
        [proofHash, txHash]
      );
    }

    console.log("");
    console.log("---------------------------------------");
    console.log("1번째 ", "Claim");
    console.log("3번째 ", "Cancel");
    console.log("13번째 ", "No approve");
    console.log("16번째 ", "No approve");
    console.log("---------------------------------------");
    console.log("");

    console.log("Add txHashes");
    const addTxHashesResult = await recorderContract.addTxHashes(txHashes);
    await addTxHashesResult.wait();
    console.log("Complete to add txHashes");

    console.log("Start to batchSwap");
    const batchSwapResult = await routerContract.batchSwap(txs, vs, rs, ss, {
      gasLimit: 10000000,
    });
    await batchSwapResult.wait();
    console.log("Complete to batch swap");

    console.log("");
    console.log("---------------------------------------");
    for (let i = 1; i <= userCount; i++) {
      const client = clients[i];
      const bTokenBalance = await bTokenContract.balanceOf(client.address);

      console.log(client.address, bTokenBalance);
    }
    console.log("---------------------------------------");
    console.log("");

    console.log("Claim");
    console.log("Operator", signer.address);
    console.log(txOrderMsg);

    //
    console.log("contractBalance", contractBalance);
    const userRouterContract = ThreesixtyRouter02Factory.connect(
      clients[1].signer
    ).attach(routerContract.address);

    console.log("Start to claim", claimTx);
    console.log(operatorSig.v, operatorSig.r, operatorSig.s);
    console.log(txOrderMsg);

    console.log("---------------------------------------");
    console.log("Before claim balance");

    console.log("User: ", await usdtContract.balanceOf(clients[1].address));
    console.log(
      "vaultContract: ",
      await usdtContract.balanceOf(vaultContract.address)
    );

    const claimTxHashResult = await userRouterContract.claim(
      txOrderMsg.round,
      txOrderMsg.order,
      txOrderMsg.proofHash,
      claimTx,
      operatorSig.v,
      operatorSig.r,
      operatorSig.s
    );
    await claimTxHashResult.wait();
    console.log("Complete to claim");

    console.log("After claim balance");

    console.log("User: ", await usdtContract.balanceOf(clients[1].address));
    console.log(
      "vaultContract: ",
      await usdtContract.balanceOf(vaultContract.address)
    );
  });
});