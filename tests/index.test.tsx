import React from "react";
import { render } from "@testing-library/react";
import { it } from "vitest";
import { createZKState } from "zk-state";

it("initializes state in a react component", async () => {
  const state = createZKState<{ num: number }>(() => ({ num: 0 }));
  const Component = () => {
    return <>hello world!</>;
  };

  const { findByText } = render(<Component />);

  await findByText("hello world!");
});
