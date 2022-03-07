import { DeployFunction } from "hardhat-deploy/dist/types";

// feeToSetterAddressr가 잘못되어 있으면 오류날 수 있음
const deployFn: DeployFunction = async (hre: any) => {
  const { feeToSetterAddress } = hre.deployConfig;
  const UniswapV2Factory = await hre.ethers.getContractFactory(
    "UniswapV2Factory"
  );

  const uniswapV2Factory = await UniswapV2Factory.deploy(feeToSetterAddress);
  await uniswapV2Factory.deployed();

  console.log("UniswapV2Factory deployed to:", uniswapV2Factory.address);
  console.log("FeeToSetterAddress:", feeToSetterAddress);
};

deployFn.tags = ["UniswapV2Factory"];

export default deployFn;
