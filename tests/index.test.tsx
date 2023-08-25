import "@vitest/web-worker";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { beforeAll, describe, expect, it } from "vitest";
import { createZKAssert, createZKState } from "zk-states";
import { ZkAppWorkerClient } from "zk-states/zkAppWorkerClient";

interface ZKState {
  testLessThan: number;
  setTestLessThan: (num: number) => void;
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
  testLessThan: 0,
  setTestLessThan: (num) =>
    set(() => {
      // TODO: if one assertion fails locally in the action, the following AND PREVIOUS should not execute the program
      zkAssert.numeric.lessThan(num, 5);
      return { testLessThan: num };
    }),
}));

describe("createZKState", () => {
  it("returns the expected hooks", () => {
    expect(useInitZKStore).toBeDefined();
    expect(useGetLatestProof).toBeDefined();
    expect(useProof).toBeDefined();
    expect(useIsInitialized).toBeDefined();
  });

  it("returns the correct initial global state values", async () => {
    const { result } = renderHook(() =>
      useZKStore((state) => state.testLessThan),
    );

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
});

describe("createZKAssert", () => {
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

  it("respects numeric.lessThan local assertion", async () => {
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.testLessThan),
    );
    const { result: resSetNum } = renderHook(() =>
      useZKStore((state) => state.setTestLessThan),
    );

    expect(resNum.current).toBe(0);

    act(() => {
      resSetNum.current(4);
    });
    expect(resNum.current).toBe(4);

    act(() => {
      resSetNum.current(5);
    });
    expect(resNum.current).toBe(4);
  });

  // it("respects numeric.lessThanOrEqual assertion", async () => {});

  // it("respects numeric.greaterThan assertion", async () => {});

  // it("respects numeric.greaterThanOrEqual assertion", async () => {});

  // it("respects numeric.equals assertion", async () => {});

  // it("respects numeric.notEquals assertion", async () => {});
});
