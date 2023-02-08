import { subtask, types } from "hardhat/config";

const log = subtask("log", "Log contract address and owner")
  .addParam("name", "Contract name", "Contract", types.string)
  .addParam("contract", "Instance of contract", undefined, types.any)
  .setAction(async (args) => {
    if (args.contract) {
      console.log(`${args.name} deployed at: ${args.contract.address}`);
      console.log(
        `${args.name} owner is: ${args.contract.deployTransaction.from}`
      );
    }
  });

module.exports = log;
