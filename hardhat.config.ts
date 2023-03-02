import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";

import * as dotenv from "dotenv";
import { utils } from "ethers/lib";
dotenv.config();

require("./tasks/deploy");

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: process.env.BOB_PK as string,
          balance: utils.parseEther("100").toString(),
        },
      ],
    },
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.BOB_PK as string],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
