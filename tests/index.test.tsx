import React from "react";
import "@vitest/web-worker";
import { fireEvent, render, waitFor } from "@testing-library/react";
import type { JsonProof } from "snarkyjs";
import { describe, expect, it } from "vitest";
import { createZKAssert, createZKState } from "zk-states";
import { ZkAppWorkerClient } from "zk-states/zkAppWorkerClient";

interface ZKState {
  num: number;
  incNum: () => void;
}

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});
const workerClient = new ZkAppWorkerClient(worker);

const zkAssert = createZKAssert(workerClient);

const {
  useInitZKStore,
  useGetLatestProof,
  useZKStore,
  useProof,
  useIsInitialized,
} = createZKState<ZKState>(workerClient, (set) => ({
  num: 0,
  incNum: () =>
    set((state) => {
      // TODO: if one assertion fails locally in the action, the following AND PREVIOUS should not execute the program
      zkAssert.numeric.lessThan(state.num, 5);
      return { num: state.num + 1 };
    }),
}));

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

  it("respects local assertions in actions", async () => {
    let proof: JsonProof | undefined;

    const Component = () => {
      const num = useZKStore((state) => state.num);
      const incNum = useZKStore((state) => state.incNum);

      const isInitialized = useIsInitialized();
      proof = useProof();

      useInitZKStore();

      return (
        <div>
          <p>isInitialized: {isInitialized ? "true" : "false"}</p>
          <p>num: {num}</p>
          <button onClick={() => incNum()}>Increment</button>
        </div>
      );
    };

    const { getByText } = render(<Component />);

    await waitFor(
      () => {
        expect(getByText("isInitialized: true")).toBeInTheDocument();
      },
      { timeout: 300000 },
    );

    expect(proof).toBeDefined();
    expect(getByText("num: 0")).toBeDefined();

    const incButton = getByText("Increment");

    fireEvent.click(incButton);
    expect(getByText("num: 1")).toBeDefined();

    fireEvent.click(incButton);
    expect(getByText("num: 2")).toBeDefined();

    fireEvent.click(incButton);
    expect(getByText("num: 3")).toBeDefined();

    fireEvent.click(incButton);
    expect(getByText("num: 4")).toBeDefined();

    fireEvent.click(incButton);
    expect(getByText("num: 5")).toBeDefined();

    fireEvent.click(incButton);
    expect(getByText("num: 5")).toBeDefined();
  });
});
