import { ethers } from "hardhat"

async function main() {
  const mimcContractAddress = "0x13Ea745805D126A396A69eD4695D603D66651996"
  const mimcContract = await ethers.getContractAt("Mimc", mimcContractAddress)

  const mimcHash = await mimcContract.hash(
    "0x01D5fb852a8107be2cad72dFf64020b22639e18B",
    "0x375734d9",
    "1000000000000000",
    "0",
    [
      '0x5E37430286E962451A0AA2FB58528C7D82C9C33C',
      '0x9AA7FEC87CA69695DD1F879567CCF49F3BA417E2'
    ],
    "0x01D5fb852a8107be2cad72dFf64020b22639e18B",
    "2",
    "1672285967"
  )

  console.log("Mimc hash: ", mimcHash)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})