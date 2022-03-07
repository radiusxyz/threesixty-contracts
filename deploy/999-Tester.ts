import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFn: DeployFunction = async (hre: any) => {
  const Tester: any = await hre.ethers.getContractFactory("Tester");

  const tester = await Tester.deploy();
  await tester.deployed();

  console.log("Tester deployed to:", tester.address);
};

deployFn.tags = ["Tester"];

export default deployFn;
