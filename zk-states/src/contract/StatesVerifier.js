var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Experimental, Field, SelfProof, SmartContract, method } from 'o1js';
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
            method(earlierProof, a, b) {
                earlierProof.verify();
                a.assertEquals(b);
            },
        },
        fieldNotEquals: {
            privateInputs: [SelfProof, Field, Field],
            method(earlierProof, a, b) {
                earlierProof.verify();
                a.assertNotEquals(b);
            },
        },
        fieldGreaterThan: {
            privateInputs: [SelfProof, Field, Field],
            method(earlierProof, a, b) {
                earlierProof.verify();
                a.assertGreaterThan(b);
            },
        },
        fieldGreaterThanOrEqual: {
            privateInputs: [SelfProof, Field, Field],
            method(earlierProof, a, b) {
                earlierProof.verify();
                a.assertGreaterThanOrEqual(b);
            },
        },
        fieldLessThan: {
            privateInputs: [SelfProof, Field, Field],
            method(earlierProof, a, b) {
                earlierProof.verify();
                a.assertLessThan(b);
            },
        },
        fieldLessThanOrEqual: {
            privateInputs: [SelfProof, Field, Field],
            method(earlierProof, a, b) {
                earlierProof.verify();
                a.lessThanOrEqual(b);
            },
        },
    },
});
export class AssertProgramProof extends Experimental.ZkProgram.Proof(Assert) {
}
export class StatesVerifier extends SmartContract {
    verifyProof(p) {
        p.verify();
    }
}
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AssertProgramProof]),
    __metadata("design:returntype", void 0)
], StatesVerifier.prototype, "verifyProof", null);
//# sourceMappingURL=StatesVerifier.js.map