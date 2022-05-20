import { DeployFunction } from "hardhat-deploy/dist/types";

// feeToSetterAddressr가 잘못되어 있으면 오류날 수 있음
const deployFn: DeployFunction = async (hre: any) => {
  const { feeToSetterAddress } = hre.deployConfig;
  const TexFactory = await hre.ethers.getContractFactory("TexFactory");

  const uniswapV2Factory = await TexFactory.deploy(feeToSetterAddress);
  await uniswapV2Factory.deployed();

  console.log("TexFactory deployed to:", uniswapV2Factory.address);
  console.log("FeeToSetterAddress:", feeToSetterAddress);
};

deployFn.tags = ["TexFactory"];

export default deployFn;
