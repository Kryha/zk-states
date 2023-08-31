import "@vitest/web-worker";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createZKAppWorkerClient,
  createZKAssert,
  createZKState,
} from "zk-states";
import type { AssertMethod } from "zk-states/types";

interface ZKState {
  num: number;
  setNum: (num: number) => void;
}

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

const workerClient = createZKAppWorkerClient(worker);
const zkAssert = createZKAssert(workerClient);

const {
  useInitZKStore,
  useZKStore,
  useProof,
  useIsInitialized,
  useQueuedAssertions,
  useIsProving,
} = createZKState<ZKState>(workerClient, (set) => ({
  num: 0,
  setNum: (num) =>
    set(() => {
      zkAssert.numeric.greaterThanOrEqual(num, 0);
      zkAssert.numeric.lessThanOrEqual(num, 5);
      return { num };
    }),
}));

describe("prove", () => {
  beforeAll(async () => {
    const { result: resProof } = renderHook(() => useProof());
    const { result: resIsInitialized } = renderHook(() => useIsInitialized());

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

  it("executes proofs successfully", async () => {
    const { result: num } = renderHook(() => useZKStore((state) => state.num));
    const { result: setNum } = renderHook(() =>
      useZKStore((state) => state.setNum),
    );
    const { result: queuedAssertions } = renderHook(() =>
      useQueuedAssertions(),
    );
    const { result: isProving } = renderHook(() => useIsProving());
    const { result: proof } = renderHook(() => useProof());

    const expectedUpdateQueue: AssertMethod[] = [
      "fieldGreaterThanOrEqual",
      "fieldLessThanOrEqual",
    ];

    const set = (value: number) =>
      act(() => {
        setNum.current(value);
      });

    expect(num.current).toBe(0);

    set(1);
    expect(num.current).toBe(1);

    await waitFor(
      () => {
        expect(isProving.current).toBe(true);
        expect(queuedAssertions.current).toStrictEqual(expectedUpdateQueue);
      },
      // TODO: benchmark proof generation time and use that as reference
      { timeout: 300000 },
    );

    set(-1);
    expect(num.current).toBe(1);
    expect(queuedAssertions.current).toStrictEqual(expectedUpdateQueue);

    set(6);
    expect(num.current).toBe(1);
    expect(queuedAssertions.current).toStrictEqual(expectedUpdateQueue);

    await waitFor(
      () => {
        expect(queuedAssertions.current).toStrictEqual([]);
        expect(proof.current).toBeDefined();
        expect(isProving.current).toBe(false);
      },
      { timeout: 300000 },
    );
  });

  // TODO: force program failure and test unhappy path
  // it("rolls back successfully on failure", async () => {});
});
