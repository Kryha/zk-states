import type { AssertMethod } from "./types";
import type { ZkAppWorkerClient } from "./zkAppWorkerClient";

export class FailedLocalAssert extends Error {
  methodName?: AssertMethod;

  constructor(methodName?: AssertMethod) {
    super();

    this.methodName = methodName;
    this.message = `Local assertion failed ${
      methodName && `at method ${methodName}`
    }`;
  }
}

type Numeric = number | bigint;

const parseNumericArgs = (a: Numeric, b: Numeric) => {
  const methodArgs = [a.toString(), b.toString()];
  return methodArgs;
};

export const createZKAssert = (workerClient: ZkAppWorkerClient) => ({
  numeric: {
    equals: (a: Numeric, b: Numeric) => {
      if (a === b) {
        const args = parseNumericArgs(a, b);
        workerClient.queueAssertions([{ name: "fieldEquals", args }]);
      } else {
        throw new FailedLocalAssert("fieldEquals");
      }
    },

    notEquals: (a: Numeric, b: Numeric) => {
      if (a !== b) {
        const args = parseNumericArgs(a, b);
        workerClient.queueAssertions([
          {
            name: "fieldNotEquals",
            args,
          },
        ]);
      } else {
        throw new FailedLocalAssert("fieldNotEquals");
      }
    },

    greaterThan: (a: Numeric, b: Numeric) => {
      if (a > b) {
        const args = parseNumericArgs(a, b);
        workerClient.queueAssertions([
          {
            name: "fieldGreaterThan",
            args,
          },
        ]);
      } else {
        throw new FailedLocalAssert("fieldGreaterThan");
      }
    },

    greaterThanOrEqual: (a: Numeric, b: Numeric) => {
      if (a >= b) {
        const args = parseNumericArgs(a, b);
        workerClient.queueAssertions([
          {
            name: "fieldGreaterThanOrEqual",
            args,
          },
        ]);
      } else {
        throw new FailedLocalAssert("fieldGreaterThanOrEqual");
      }
    },

    lessThan: (a: Numeric, b: Numeric) => {
      if (a < b) {
        const args = parseNumericArgs(a, b);
        workerClient.queueAssertions([
          {
            name: "fieldLessThan",
            args,
          },
        ]);
      } else {
        throw new FailedLocalAssert("fieldLessThan");
      }
    },

    lessThanOrEqual: (a: Numeric, b: Numeric) => {
      if (a <= b) {
        const args = parseNumericArgs(a, b);
        workerClient.queueAssertions([
          {
            name: "fieldLessThanOrEqual",
            args,
          },
        ]);
      } else {
        throw new FailedLocalAssert("fieldGreaterThanOrEqual");
      }
    },

    /**
     * @deprecated this method is for testing purposes only
     */
    equalsNoLocalCheck: (a: Numeric, b: Numeric) => {
      const args = parseNumericArgs(a, b);
      workerClient.queueAssertions([
        {
          name: "fieldEquals",
          args,
        },
      ]);
    },
  },
});
