import { create } from "zk-state";
import { it, expect } from "vitest";

it("creates a store hook and api object", () => {
  let params;
  const result = create((...args) => {
    params = args;
    return { value: null };
  });
  expect({ params, result }).toMatchInlineSnapshot(`
      {
        "params": [
          [Function],
          [Function],
          {
            "destroy": [Function],
            "getState": [Function],
            "setState": [Function],
            "subscribe": [Function],
          },
        ],
        "result": [Function],
      }
    `);
});
