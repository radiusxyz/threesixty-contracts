import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFn: DeployFunction = async (hre: any) => {
  const ERC20: any = await hre.ethers.getContractFactory("ERC20");
  const signer = await hre.ethers.getSigner();
  const { tokenName, tokenSymbol, totalSupply } = hre.deployConfig;

  const erc20 = await ERC20.deploy(tokenName, tokenSymbol, totalSupply);
  await erc20.deployed();

  console.log("ERC20 deployed to:", erc20.address);
  console.log("name", await erc20.name());
  console.log("symbol", await erc20.symbol());
  console.log("decimals", await erc20.decimals());
  console.log("totalSupply", await erc20.totalSupply());
  console.log("balanceOf", await erc20.balanceOf(signer.address));
  console.log("DOMAIN_SEPARATOR", await erc20.DOMAIN_SEPARATOR());
  console.log("PERMIT_TYPEHASH", await erc20.PERMIT_TYPEHASH());
};

deployFn.tags = ["ERC20"];

export default deployFn;
