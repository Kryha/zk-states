import { Experimental, Field, SelfProof, SmartContract, method } from "o1js";

export type AssertProof = SelfProof<void, void>;

export const Assert = Experimental.ZkProgram({
  methods: {
    init: {
      privateInputs: [],

      method() {
        // keep empty
      },
    },

    fieldEquals: {
      privateInputs: [SelfProof, Field, Field],

      method(earlierProof: AssertProof, a: Field, b: Field) {
        earlierProof.verify();
        a.assertEquals(b);
      },
    },

    fieldNotEquals: {
      privateInputs: [SelfProof, Field, Field],

      method(earlierProof: AssertProof, a: Field, b: Field) {
        earlierProof.verify();
        a.assertNotEquals(b);
      },
    },

    fieldGreaterThan: {
      privateInputs: [SelfProof, Field, Field],

      method(earlierProof: AssertProof, a: Field, b: Field) {
        earlierProof.verify();
        a.assertGreaterThan(b);
      },
    },

    fieldGreaterThanOrEqual: {
      privateInputs: [SelfProof, Field, Field],

      method(earlierProof: AssertProof, a: Field, b: Field) {
        earlierProof.verify();
        a.assertGreaterThanOrEqual(b);
      },
    },

    fieldLessThan: {
      privateInputs: [SelfProof, Field, Field],

      method(earlierProof: AssertProof, a: Field, b: Field) {
        earlierProof.verify();
        a.assertLessThan(b);
      },
    },

    fieldLessThanOrEqual: {
      privateInputs: [SelfProof, Field, Field],

      method(earlierProof: AssertProof, a: Field, b: Field) {
        earlierProof.verify();
        a.assertLessThanOrEqual(b);
      },
    },
  },
});

export class AssertProgramProof extends Experimental.ZkProgram.Proof(Assert) {}

export class StatesVerifier extends SmartContract {
  @method verifyProof(p: AssertProgramProof) {
    p.verify();
  }
}
