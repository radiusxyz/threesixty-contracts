import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFn: DeployFunction = async (hre: any) => {
  const UniswapV2Router02: any = await hre.ethers.getContractFactory(
    "UniswapV2Router02"
  );

  const uniswapV2Router02 = await UniswapV2Router02.deploy(
    process.env.FACTORY_CONTRACT_ADDRESS, // Factory address
    process.env.WETH9_CONTRACT_ADDRESS // WETH address
  );
  await uniswapV2Router02.deployed();

  console.log("UniswapV2Router02 deployed to:", uniswapV2Router02.address);
};

deployFn.tags = ["UniswapV2Router02"];

export default deployFn;
