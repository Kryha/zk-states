import React from "react";
import "@vitest/web-worker";
import { render, waitFor } from "@testing-library/react";
import type { JsonProof } from "snarkyjs";
import { describe, expect, it } from "vitest";
import { createZKState } from "zk-states";

interface ZKState {
  num: number;
  incNum: () => void;
}

const {
  useInitZKStore,
  useGetLatestProof,
  useZKStore,
  useProof,
  useIsInitialized,
} = createZKState<ZKState>(
  new Worker(new URL("./worker.ts", import.meta.url), {
    type: "module",
  }),
  (set) => ({
    num: 0,
    incNum: () => set((state) => ({ num: state.num + 1 })),
  }),
);

describe("createZKState", () => {
  it("returns the expected hooks", () => {
    expect(useInitZKStore).toBeDefined();
    expect(useGetLatestProof).toBeDefined();
    expect(useProof).toBeDefined();
    expect(useIsInitialized).toBeDefined();
  });

  it("renders the correct initial global state value in a React component", async () => {
    const expectedValue = 0;

    const Component = () => {
      const num = useZKStore((state) => state.num);
      return <div>num: {num}</div>;
    };

    const { findByText } = render(<Component />);

    await findByText(`num: ${expectedValue}`);
  });

  it("correctly initializes ZK store with useInitZKStore", async () => {
    let proof: JsonProof | undefined;

    const Component = () => {
      const isInitialized = useIsInitialized();
      proof = useProof();
      useInitZKStore();
      return <div>isInitialized: {isInitialized ? "true" : "false"}</div>;
    };

    const { getByText } = render(<Component />);

    await waitFor(
      () => {
        expect(getByText("isInitialized: true")).toBeInTheDocument();
      },
      { timeout: 300000 },
    );

    expect(proof).toBeDefined();
  });
});
