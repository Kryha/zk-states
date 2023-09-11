import { SelfProof, SmartContract } from 'o1js';
export type AssertProof = SelfProof<void, void>;
export declare const Assert: {
    name: string;
    compile: () => Promise<{
        verificationKey: string;
    }>;
    verify: (proof: import("o1js/dist/node/lib/proof_system").Proof<undefined, void>) => Promise<boolean>;
    digest: () => string;
    analyzeMethods: () => {
        rows: number;
        digest: string;
        result: unknown;
        gates: import("o1js/dist/node/snarky").Gate[];
        publicInputSize: number;
    }[];
    publicInputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<undefined, null>;
    publicOutputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<void, null>;
} & {
    init: (...args: [] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, void>>;
    fieldEquals: (...args: [SelfProof<unknown, unknown>, import("o1js/dist/node/lib/field").Field, import("o1js/dist/node/lib/field").Field] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, void>>;
    fieldNotEquals: (...args: [SelfProof<unknown, unknown>, import("o1js/dist/node/lib/field").Field, import("o1js/dist/node/lib/field").Field] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, void>>;
    fieldGreaterThan: (...args: [SelfProof<unknown, unknown>, import("o1js/dist/node/lib/field").Field, import("o1js/dist/node/lib/field").Field] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, void>>;
    fieldGreaterThanOrEqual: (...args: [SelfProof<unknown, unknown>, import("o1js/dist/node/lib/field").Field, import("o1js/dist/node/lib/field").Field] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, void>>;
    fieldLessThan: (...args: [SelfProof<unknown, unknown>, import("o1js/dist/node/lib/field").Field, import("o1js/dist/node/lib/field").Field] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, void>>;
    fieldLessThanOrEqual: (...args: [SelfProof<unknown, unknown>, import("o1js/dist/node/lib/field").Field, import("o1js/dist/node/lib/field").Field] & any[]) => Promise<import("o1js/dist/node/lib/proof_system").Proof<undefined, void>>;
};
declare const AssertProgramProof_base: {
    new ({ proof, publicInput, publicOutput, maxProofsVerified, }: {
        proof: unknown;
        publicInput: undefined;
        publicOutput: void;
        maxProofsVerified: 0 | 1 | 2;
    }): {
        publicInput: undefined;
        publicOutput: void;
        proof: unknown;
        maxProofsVerified: 0 | 1 | 2;
        shouldVerify: import("o1js/dist/node/lib/bool").Bool;
        verify(): void;
        verifyIf(condition: import("o1js/dist/node/lib/bool").Bool): void;
        toJSON(): import("o1js/dist/node/lib/proof_system").JsonProof;
    };
    publicInputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<undefined, null>;
    publicOutputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<void, null>;
    tag: () => {
        name: string;
        publicInputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<undefined, null>;
        publicOutputType: import("o1js/dist/node/lib/circuit_value").ProvablePureExtended<void, null>;
    };
    fromJSON<S extends (new (...args: any) => import("o1js/dist/node/lib/proof_system").Proof<unknown, unknown>) & {
        prototype: import("o1js/dist/node/lib/proof_system").Proof<any, any>;
        publicInputType: import("o1js/dist/node/lib/circuit_value").FlexibleProvablePure<any>;
        publicOutputType: import("o1js/dist/node/lib/circuit_value").FlexibleProvablePure<any>;
        tag: () => {
            name: string;
        };
        fromJSON: typeof import("o1js/dist/node/lib/proof_system").Proof.fromJSON;
    } & {
        prototype: import("o1js/dist/node/lib/proof_system").Proof<unknown, unknown>;
    }>(this: S, { maxProofsVerified, proof: proofString, publicInput: publicInputJson, publicOutput: publicOutputJson, }: import("o1js/dist/node/lib/proof_system").JsonProof): import("o1js/dist/node/lib/proof_system").Proof<import("o1js/dist/node/bindings/lib/provable-snarky").InferProvable<S["publicInputType"]>, import("o1js/dist/node/bindings/lib/provable-snarky").InferProvable<S["publicOutputType"]>>;
};
export declare class AssertProgramProof extends AssertProgramProof_base {
}
export declare class StatesVerifier extends SmartContract {
    verifyProof(p: AssertProgramProof): void;
}
export {};
