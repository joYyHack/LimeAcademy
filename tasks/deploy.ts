import { task, types } from "hardhat/config";
import { formatEther } from "@ethersproject/units";

require("./subtasks/log");

const deploy = task("deploy", "Deploy a contract")
  .addPositionalParam("name", "Contract name", "BookLibrary", types.string)
  .setAction(async (args, hre) => {
    const owner = (await hre.ethers.getSigners())[0];
    const factory = await hre.ethers.getContractFactory(
      args.name as string,
      owner
    );
    const contract = await factory.deploy();
    await contract.deployed();

    await hre.run("log", { name: args.name, contract: contract });
  });

module.exports = deploy;
