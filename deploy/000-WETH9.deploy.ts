import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFn: DeployFunction = async (hre: any) => {
  const WETH9: any = await hre.ethers.getContractFactory("WETH9");

  const weth = await WETH9.deploy();
  await weth.deployed();

  console.log("WETH9 deployed to:", weth.address);
};

deployFn.tags = ["WETH9"];

export default deployFn;
