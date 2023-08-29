import type { AssertMethodsPayload } from "./types";

interface Globals {
  stateHistory: Record<string, unknown>;
  latestAssertions: AssertMethodsPayload;
}

export const globals: Globals = {
  // Key is an uuid that is generated whenever an action gets triggered
  // value is the state when that action got triggered
  // when proof succeeds, delete the value of the corresponding key
  // if proof fails, set the current state to the value present at that key
  stateHistory: {},
  latestAssertions: [],
};
