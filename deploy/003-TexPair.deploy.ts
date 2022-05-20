import { DeployFunction } from "hardhat-deploy/dist/types";

// uniswapV2FactoryAddress, aTokenContractAddress, bTokenContractAddress 중 잘못된 주소가 있으면 오류날 수 있음
// 이미 paring한 토큰은 오류를 발생시킴
const deployFn: DeployFunction = async (hre: any) => {
  const {
    uniswapV2FactoryAddress,
    aTokenContractAddress,
    bTokenContractAddress,
  } = hre.deployConfig;

  const TexFactory = await hre.ethers.getContractFactory("TexFactory");
  const uniswapV2Factory = await TexFactory.attach(uniswapV2FactoryAddress);

  await uniswapV2Factory.createPair(
    aTokenContractAddress,
    bTokenContractAddress
  );
  const uniswapV2PairAddress = await uniswapV2Factory.getPair(
    aTokenContractAddress,
    bTokenContractAddress
  );

  console.log("TexPair deployed to:", uniswapV2PairAddress);
  console.log("Current pair count:", await uniswapV2Factory.allPairsLength());
};

deployFn.tags = ["TexPair"];

export default deployFn;
