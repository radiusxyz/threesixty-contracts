import { ethers } from "hardhat"

async function main() {
  const accounts = await ethers.getSigners()

  const amountIn = "1000000000000"
  const routerContractAddress = "0x32c65798B12c58D27E64EFbE40237aD4E0BB403d" // ThreesixtyRouter
  const mimcContractAddress = "0x59DCf65582aFef2A628fe182903F5DE9e4574B6c"

  const aTokenContractAddress = "0x5E37430286E962451a0Aa2FB58528C7D82c9C33C" // UNI
  const bTokenContractAddress = "0x9aa7fEc87CA69695Dd1f879567CcF49F3ba417E2" // USDC

  const routerContract = await ethers.getContractAt("ThreesixtyRouter02", routerContractAddress)
  const recorderContractAddress = await routerContract.recorder()

  const recorderContract = await ethers.getContractAt("Recorder", recorderContractAddress)
  const mimcContract = await ethers.getContractAt("contracts/test/Mimc.sol:Mimc", mimcContractAddress)
  let aTokenContract = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", aTokenContractAddress)
  let bTokenContract = await ethers.getContractAt("contracts/interfaces/IERC20.sol:IERC20", bTokenContractAddress)

  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Swap: [
        { name: 'txOwner', type: 'address' },
        { name: 'functionSelector', type: 'bytes4' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOut', type: 'uint256' },
        { name: 'path', type: 'address[]' },
        { name: 'to', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'availableFrom', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    },
    primaryType: 'Swap',
    domain: {
      name: 'Threesixty swap',
      version: '1',
      chainId: 80001,
      verifyingContract: routerContract.address,
    },
  }

  const txHashes: any = []
  const txs: any = []
  const rs: any = []
  const ss: any = []
  const vs: any = []
  let hash = "0x0000000000000000000000000000000000000000000000000000000000000000"

  for (let i = 1; i <= 1; i++) {
    const client = accounts[0]
    aTokenContract = aTokenContract.connect(client)
    console.log("Client address: ", client.address)

    const approveResult = await aTokenContract.approve(routerContract.address, amountIn)
    await approveResult.wait()

    console.log(`${await aTokenContract.name()} (${await aTokenContract.symbol()})`)
    console.log(`${client.address} balance: ${(await aTokenContract.balanceOf(client.address)).toString()}`)
    console.log(`${client.address} allowance to ${routerContract.address}: ${(await aTokenContract.allowance(client.address, routerContract.address)).toString()}`)

    const tx = {
      txOwner: client.address,
      functionSelector: "0x375734d9",
      amountIn: amountIn,
      amountOut: "0",
      path: [
        aTokenContractAddress,
        bTokenContractAddress,
      ],
      to: client.address,
      nonce: (await routerContract.nonces(client.address)).toString(),
      availableFrom: Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 2,
      // deadline: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2
      deadline: 1968845350
    }

    const mimcHash = await mimcContract.hash(
      tx.txOwner,
      tx.functionSelector,
      tx.amountIn,
      tx.amountOut,
      tx.path,
      tx.to,
      tx.nonce,
      tx.deadline
    )

    hash = ethers.utils.solidityKeccak256(
      ['bytes32', 'bytes32'],
      [hash, mimcHash],
    )

    const txHash = ethers.utils._TypedDataEncoder.hash(typedData.domain, { Swap: typedData.types.Swap }, tx)
    const signatureHex = await client._signTypedData(typedData.domain, { Swap: typedData.types.Swap }, tx)

    const userSig = ethers.utils.splitSignature(signatureHex)
    console.log("verifyMessage", ethers.utils.recoverAddress(txHash, userSig) === tx.txOwner)

    txHashes.push(txHash)
    txs.push(tx)
    rs.push(userSig.r)
    ss.push(userSig.s)
    vs.push(userSig.v)
  }
  const addTxHashesResult = await recorderContract.connect(accounts[2]).addTxHashes(txHashes)
  await addTxHashesResult.wait()
  console.log("Complete to add tx hashes", addTxHashesResult.hash)
  console.log("Validate order", await recorderContract.validate(txHashes[0], accounts[0].address))

  const beforeATokenBalance = await aTokenContract.balanceOf(accounts[0].address)
  const beforeBTokenBalance = await bTokenContract.balanceOf(accounts[0].address)
  const batchSwapResult = await routerContract.connect(accounts[2]).batchSwap(txs, vs, rs, ss, { gasLimit: 10000000 })
  await batchSwapResult.wait()
  console.log("Complete to batch swap", batchSwapResult.hash)
  const afterATokenBalance = await aTokenContract.balanceOf(accounts[0].address)
  const afterBTokenBalance = await bTokenContract.balanceOf(accounts[0].address)

  console.log("beforeBTokenBalance", beforeBTokenBalance.toString())
  console.log("afterBTokenBalance", afterBTokenBalance.toString())

  console.log("beforeATokenBalance", beforeATokenBalance.toString())
  console.log("afterATokenBalance", afterATokenBalance.toString())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})