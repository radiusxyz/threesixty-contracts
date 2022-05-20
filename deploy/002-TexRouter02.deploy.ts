import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFn: DeployFunction = async (hre: any) => {
  const TexRouter02: any = await hre.ethers.getContractFactory("TexRouter02");

  const uniswapV2Router02 = await TexRouter02.deploy(
    process.env.RECORDER_CONTRACT_ADDRESS,
    process.env.FACTORY_CONTRACT_ADDRESS, // Factory address
    process.env.WETH9_CONTRACT_ADDRESS // WETH address
  );
  await uniswapV2Router02.deployed();

  console.log("TexRouter02 deployed to:", uniswapV2Router02.address);
};

deployFn.tags = ["TexRouter02"];

export default deployFn;
