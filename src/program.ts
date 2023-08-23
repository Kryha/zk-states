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

// const ProgramWithInit = Experimental.ZkProgram({
//   methods: { init: { privateInputs: [], method() {} } },
// });

// const commonProgramMethods = Object.keys(ProgramWithInit);
// type CommonProgramFunctions = keyof typeof ProgramWithInit;

// export const assertMethods = Object.keys(Assert).filter(
//   (method) => !commonProgramMethods.includes(method),
// );
// export type AssertMethod = Exclude<keyof typeof Assert, CommonProgramFunctions>;

// export const StateTracker = Experimental.ZkProgram({
//   publicInput: Field,

//   methods: {
//     create: {
//       privateInputs: [CircuitString, MerkleWitness20],

//       method(
//         stateTreeRoot: Field,
//         initialState: CircuitString,
//         stateTreeWitness: MerkleWitness20,
//       ) {
//         initialState.assertEquals(CircuitString.fromString(INITIAL_STATE));

//         const computedStateTreeRoot = stateTreeWitness.calculateRoot(
//           Poseidon.hash(initialState.toFields()),
//         );
//         computedStateTreeRoot.assertEquals(stateTreeRoot);
//       },
//     },

//     update: {
//       privateInputs: [SelfProof, CircuitString, MerkleWitness20],

//       method(
//         stateTreeRoot: Field,
//         earlierProof: SelfProof<Field, void>,
//         newLocalState: CircuitString,
//         stateTreeWitness: MerkleWitness20,
//       ) {
//         earlierProof.verify();

//         const newStateTreeRoot = stateTreeWitness.calculateRoot(
//           Poseidon.hash(newLocalState.toFields()),
//         );
//         newStateTreeRoot.assertEquals(stateTreeRoot);
//       },
//     },
//   },
// });
