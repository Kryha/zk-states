import React from "react";
import { render } from "@testing-library/react";
import { it } from "vitest";

it("initializes state in a react component", async () => {
  const Component = () => {
    return <>hello world!</>;
  };

  const { findByText } = render(<Component />);

  await findByText("hello world!");
});
