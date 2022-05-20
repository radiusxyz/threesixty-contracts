import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFn: DeployFunction = async (hre: any) => {
  const Recorder = await hre.ethers.getContractFactory("Recorder");

  const recorder = await Recorder.deploy();
  await recorder.deployed();

  console.log("Recorder deployed to:", recorder.address);
};

deployFn.tags = ["Recorder"];

export default deployFn;
