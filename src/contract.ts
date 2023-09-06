/* eslint-disable @typescript-eslint/consistent-type-imports */
import { SelfProof, SmartContract, method } from "snarkyjs";

export class StatesVerifier extends SmartContract {
  @method verifyProof(p: SelfProof<void, void>) {
    p.verify();
  }
}
