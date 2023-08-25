import "@vitest/web-worker";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
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

  it("returns the correct initial global state value", async () => {
    const { result } = renderHook(() => useZKStore((state) => state.num));

    expect(result.current).toBe(0);
  });

  it("correctly initializes ZK store with useInitZKStore", async () => {
    const { result: resIsInitialized } = renderHook(() => useIsInitialized());
    const { result: resProof } = renderHook(() => useProof());

    renderHook(() => {
      useInitZKStore();
    });

    await waitFor(
      () => {
        expect(resIsInitialized.current).toBe(true);
      },
      { timeout: 300000 },
    );

    expect(resProof.current).toBeDefined();
  });

  it("respects local assertions in actions", async () => {
    const { result: resIsInitialized } = renderHook(() => useIsInitialized());
    const { result: resProof } = renderHook(() => useProof());
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.num),
    );
    const { result: resIncNum } = renderHook(() =>
      useZKStore((state) => state.incNum),
    );

    renderHook(() => {
      useInitZKStore();
    });

    await waitFor(
      () => {
        expect(resIsInitialized.current).toBe(true);
      },
      { timeout: 300000 },
    );

    expect(resProof.current).toBeDefined();
    expect(resNum.current).toBe(0);

    const increment = () =>
      act(() => {
        resIncNum.current();
      });

    increment();
    expect(resNum.current).toBe(1);

    increment();
    expect(resNum.current).toBe(2);

    increment();
    expect(resNum.current).toBe(3);

    increment();
    expect(resNum.current).toBe(4);

    increment();
    expect(resNum.current).toBe(5);

    increment();
    expect(resNum.current).toBe(5);
  });
});
