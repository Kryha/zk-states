import {
  CircuitString,
  Experimental,
  Field,
  Poseidon,
  SelfProof,
} from "snarkyjs";
import { INITIAL_STATE, MerkleWitness20 } from "./utils";

export const StateTracker = Experimental.ZkProgram({
  publicInput: Field,

  methods: {
    create: {
      privateInputs: [CircuitString, MerkleWitness20],

      method(
        stateTreeRoot: Field,
        initialState: CircuitString,
        stateTreeWitness: MerkleWitness20
      ) {
        initialState.assertEquals(CircuitString.fromString(INITIAL_STATE));

        const computedStateTreeRoot = stateTreeWitness.calculateRoot(
          Poseidon.hash(initialState.toFields())
        );
        computedStateTreeRoot.assertEquals(stateTreeRoot);
      },
    },

    update: {
      privateInputs: [SelfProof, CircuitString, MerkleWitness20],

      method(
        stateTreeRoot: Field,
        earlierProof: SelfProof<Field, void>,
        newLocalState: CircuitString,
        stateTreeWitness: MerkleWitness20
      ) {
        earlierProof.verify();

        const newStateTreeRoot = stateTreeWitness.calculateRoot(
          Poseidon.hash(newLocalState.toFields())
        );
        newStateTreeRoot.assertEquals(stateTreeRoot);
      },
    },
  },
});
