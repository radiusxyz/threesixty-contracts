import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFn: DeployFunction = async (hre: any) => {
  const CalHash: any = await hre.ethers.getContractFactory(
    "contracts/Tex/CalHash.sol:CalHash"
  );

  const calHash = await CalHash.deploy();
  await calHash.deployed();

  console.log("CalHash deployed to:", calHash.address);
};

deployFn.tags = ["CalHash"];

export default deployFn;
