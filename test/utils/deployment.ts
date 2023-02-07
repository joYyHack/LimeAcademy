import { ethers } from "hardhat";

import { Signer } from "@ethersproject/abstract-signer/src.ts/index";
import type { Contract } from "ethers";

export const deploy = async (
  name: string,
  signer: Signer
): Promise<Contract> => {
  const factory = await ethers.getContractFactory(name, signer);
  const ctr = await factory.deploy();

  return ctr;
};
