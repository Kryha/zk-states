import { Experimental, Field, SelfProof } from "snarkyjs";
import type { AssertProof } from "./types";

// TODO: check if we need to provide some public input
export const Assert = Experimental.ZkProgram({
  methods: {
    init: {
      privateInputs: [],

      method() {},
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
        a.lessThanOrEqual(b);
      },
    },
  },
});
