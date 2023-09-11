import { Field } from "o1js";
import { Assert, type AssertProgramProof } from "./contract";
import type { AssertMethod } from "./types";

const argsError = (methodName: AssertMethod) =>
  new Error(`Invalid args provided for ${methodName}`);

const argsToField = (
  methodName: AssertMethod,
  args: string[],
  desiredLength: number,
) => {
  if (args.length !== desiredLength) throw argsError(methodName);
  return args.map((arg) => Field.fromJSON(arg));
};

export const prove = (
  previousProof: AssertProgramProof,
  methodName: AssertMethod,
  args: string[],
) => {
  switch (methodName) {
    case "fieldEquals": {
      const [a, b] = argsToField(methodName, args, 2);
      return Assert.fieldEquals(previousProof, a, b);
    }

    case "fieldNotEquals": {
      const [a, b] = argsToField(methodName, args, 2);
      return Assert.fieldNotEquals(previousProof, a, b);
    }

    case "fieldGreaterThan": {
      const [a, b] = argsToField(methodName, args, 2);
      return Assert.fieldGreaterThan(previousProof, a, b);
    }

    case "fieldGreaterThanOrEqual": {
      const [a, b] = argsToField(methodName, args, 2);
      return Assert.fieldGreaterThanOrEqual(previousProof, a, b);
    }

    case "fieldLessThan": {
      const [a, b] = argsToField(methodName, args, 2);
      return Assert.fieldLessThan(previousProof, a, b);
    }

    case "fieldLessThanOrEqual": {
      const [a, b] = argsToField(methodName, args, 2);
      return Assert.fieldLessThanOrEqual(previousProof, a, b);
    }
  }
};
