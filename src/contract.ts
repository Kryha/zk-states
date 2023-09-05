import type { Proof } from "snarkyjs";
import { SmartContract, method } from "snarkyjs";

export class StatesVerifier extends SmartContract {
  @method verifyProof(p: Proof<void, void>) {
    p.verify();
  }
}
