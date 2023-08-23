import { ZkAppWorkerClient } from "./zkAppWorkerClient";

type Numeric = number | bigint;

const parseNumericArgs = (a: Numeric, b: Numeric) => {
  const methodArgs = [a.toString(), b.toString()];
  return methodArgs;
};

export const createZKAssert = (worker: Worker) => {
  const workerClient = new ZkAppWorkerClient(worker);

  return {
    numeric: {
      equals: (a: Numeric, b: Numeric) => {
        if (a === b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({ methodName: "fieldEquals", methodArgs });
          return true;
        } else {
          return false;
        }
      },

      notEquals: (a: Numeric, b: Numeric) => {
        if (a !== b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldNotEquals",
            methodArgs,
          });
          return true;
        } else {
          return false;
        }
      },

      greaterThan: (a: Numeric, b: Numeric) => {
        if (a > b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldGreaterThan",
            methodArgs,
          });
          return true;
        } else {
          return false;
        }
      },

      greaterThanOrEqual: (a: Numeric, b: Numeric) => {
        if (a >= b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldGreaterThanOrEqual",
            methodArgs,
          });
          return true;
        } else {
          return false;
        }
      },

      lessThan: (a: Numeric, b: Numeric) => {
        if (a < b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldLessThan",
            methodArgs,
          });
          return true;
        } else {
          return false;
        }
      },

      lessThanOrEqual: (a: Numeric, b: Numeric) => {
        if (a <= b) {
          const methodArgs = parseNumericArgs(a, b);
          workerClient.callAssertion({
            methodName: "fieldLessThanOrEqual",
            methodArgs,
          });
          return true;
        } else {
          return false;
        }
      },
    },
  };
};
