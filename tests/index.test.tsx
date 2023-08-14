import React from "react";
import { render } from "@testing-library/react";
import { it } from "vitest";

// TODO: fix wasm error when importing zk-states library
it("initializes state in a react component", async () => {
  const Component = () => {
    return <>hello world!</>;
  };

  const { findByText } = render(<Component />);

  await findByText("hello world!");
});
