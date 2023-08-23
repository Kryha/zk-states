import { Field } from "snarkyjs";
import { Assert } from "./program";
import type { AssertMethod, AssertProof } from "./types";

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
  previousProof: AssertProof,
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
      return Assert.fieldEquals(previousProof, a, b);
    }

    case "fieldLessThanOrEqual": {
      const [a, b] = argsToField(methodName, args, 2);
      return Assert.fieldEquals(previousProof, a, b);
    }
  }
};
