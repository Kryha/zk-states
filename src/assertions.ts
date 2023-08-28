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

export const createZKAssert = (workerClient: ZkAppWorkerClient) => {
  return {
    numeric: {
      equals: (a: Numeric, b: Numeric) => {
        if (a === b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({ methodName: "fieldEquals", methodArgs });
        } else {
          throw new FailedLocalAssert("fieldEquals");
        }
      },

      notEquals: (a: Numeric, b: Numeric) => {
        if (a !== b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldNotEquals",
            methodArgs,
          });
        } else {
          throw new FailedLocalAssert("fieldNotEquals");
        }
      },

      greaterThan: (a: Numeric, b: Numeric) => {
        if (a > b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldGreaterThan",
            methodArgs,
          });
        } else {
          throw new FailedLocalAssert("fieldGreaterThan");
        }
      },

      greaterThanOrEqual: (a: Numeric, b: Numeric) => {
        if (a >= b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldGreaterThanOrEqual",
            methodArgs,
          });
        } else {
          throw new FailedLocalAssert("fieldGreaterThanOrEqual");
        }
      },

      lessThan: (a: Numeric, b: Numeric) => {
        if (a < b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldLessThan",
            methodArgs,
          });
        } else {
          throw new FailedLocalAssert("fieldLessThan");
        }
      },

      lessThanOrEqual: (a: Numeric, b: Numeric) => {
        if (a <= b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldLessThanOrEqual",
            methodArgs,
          });
        } else {
          throw new FailedLocalAssert("fieldGreaterThanOrEqual");
        }
      },
    },
  };
};
