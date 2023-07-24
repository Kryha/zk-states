import { SmartContract } from "snarkyjs";

export const createZKState = (contract: SmartContract) => {
  console.log("createZKState:", contract.address);
  return contract.address;
};
