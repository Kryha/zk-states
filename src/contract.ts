/* eslint-disable @typescript-eslint/consistent-type-imports */
import { SelfProof, SmartContract, method } from "o1js";

export class StatesVerifier extends SmartContract {
  @method verifyProof(p: SelfProof<void, void>) {
    p.verify();
  }
}
