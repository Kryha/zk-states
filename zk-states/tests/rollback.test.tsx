import "@vitest/web-worker";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { beforeAll, describe, expect, it } from "vitest";
import {
  createZKAppWorkerClient,
  createZKAssert,
  createZKState,
} from "zk-states";

interface ZKState {
  num: number;
  setNum: (num: number) => void;
  setNumFail: (num: number) => void;
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
  useProofFailed,
} = createZKState<ZKState>(workerClient, (set) => ({
  num: 0,
  setNum: (num) =>
    set(() => {
      zkAssert.numeric.greaterThanOrEqual(num, 0);
      zkAssert.numeric.lessThanOrEqual(num, 5);
      return { num };
    }),
  setNumFail: (num) =>
    set(() => {
      zkAssert.numeric.equalsNoLocalCheck(num, 5);
      zkAssert.numeric.lessThanOrEqual(num, 5);
      return { num };
    }),
}));

describe("rollback", () => {
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

  it("rolls back successfully on failure", async () => {
    const { result: num } = renderHook(() => useZKStore((state) => state.num));
    const { result: setNum } = renderHook(() =>
      useZKStore((state) => state.setNum),
    );
    const { result: setNumFail } = renderHook(() =>
      useZKStore((state) => state.setNumFail),
    );
    const { result: queuedAssertions } = renderHook(() =>
      useQueuedAssertions(),
    );
    const { result: isProving } = renderHook(() => useIsProving());
    const { result: proof } = renderHook(() => useProof());
    const { result: proofFailed } = renderHook(() => useProofFailed());

    const set = (value: number) =>
      act(() => {
        setNum.current(value);
      });

    const setFail = (value: number) =>
      act(() => {
        setNumFail.current(value);
      });

    expect(num.current).toBe(0);

    set(1);
    expect(num.current).toBe(1);

    await waitFor(
      () => {
        expect(isProving.current).toBe(true);
        expect(queuedAssertions.current).toStrictEqual([
          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",
        ]);
      },
      { timeout: 300000 },
    );
    expect(proofFailed.current).toBe(false);

    set(2);
    expect(num.current).toBe(2);

    await waitFor(
      () => {
        expect(queuedAssertions.current).toStrictEqual([
          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",

          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",
        ]);
      },
      { timeout: 300000 },
    );

    setFail(3);
    expect(num.current).toBe(3);

    await waitFor(
      () => {
        expect(queuedAssertions.current).toStrictEqual([
          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",

          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",

          "fieldEquals",
          "fieldLessThanOrEqual",
        ]);
      },
      { timeout: 300000 },
    );

    set(4);
    expect(num.current).toBe(4);

    await waitFor(
      () => {
        expect(queuedAssertions.current).toStrictEqual([
          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",

          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",

          "fieldEquals",
          "fieldLessThanOrEqual",

          "fieldGreaterThanOrEqual",
          "fieldLessThanOrEqual",
        ]);
      },
      { timeout: 300000 },
    );

    await waitFor(
      () => {
        expect(queuedAssertions.current).toStrictEqual([]);
      },
      { timeout: 300000 },
    );
    expect(num.current).toBe(2);
    expect(proof.current).toBeDefined();
    expect(isProving.current).toBe(false);
    expect(proofFailed.current).toBe(true);

    set(3);
    expect(num.current).toBe(3);

    await waitFor(
      () => {
        expect(queuedAssertions.current).toStrictEqual([]);
      },
      { timeout: 300000 },
    );
    expect(num.current).toBe(3);
    expect(proof.current).toBeDefined();
    expect(isProving.current).toBe(false);
    expect(proofFailed.current).toBe(false);
  });
});
