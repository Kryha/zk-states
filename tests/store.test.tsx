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
  testLessThan: number;
  testLessThanOrEqual: number;
  testGreaterThan: number;
  testGreaterThanOrEqual: number;
  testEquals: number;
  testNotEquals: number;

  setTestLessThan: (num: number) => void;
  setTestLessThanOrEqual: (num: number) => void;
  setTestGreaterThan: (num: number) => void;
  setTestGreaterThanOrEqual: (num: number) => void;
  setTestEquals: (num: number) => void;
  setTestNotEquals: (num: number) => void;
}

const worker = new Worker(new URL("./worker.ts", import.meta.url), {
  type: "module",
});

const workerClient = createZKAppWorkerClient(worker);
const zkAssert = createZKAssert(workerClient);

const { useInitZKStore, useZKStore, useProof, useIsInitialized } =
  createZKState<ZKState>(workerClient, (set) => ({
    testLessThan: 0,
    testLessThanOrEqual: 0,
    testGreaterThan: 0,
    testGreaterThanOrEqual: 0,
    testEquals: 0,
    testNotEquals: 0,

    setTestLessThan: (num) =>
      set(() => {
        zkAssert.numeric.lessThan(num, 5);
        return { testLessThan: num };
      }),

    setTestLessThanOrEqual: (num) =>
      set(() => {
        zkAssert.numeric.lessThanOrEqual(num, 5);
        return { testLessThanOrEqual: num };
      }),

    setTestGreaterThan: (num) =>
      set(() => {
        zkAssert.numeric.greaterThan(num, 5);
        return { testGreaterThan: num };
      }),

    setTestGreaterThanOrEqual: (num) =>
      set(() => {
        zkAssert.numeric.greaterThanOrEqual(num, 5);
        return { testGreaterThanOrEqual: num };
      }),

    setTestEquals: (num) =>
      set(() => {
        zkAssert.numeric.equals(num, 5);
        return { testEquals: num };
      }),

    setTestNotEquals: (num) =>
      set(() => {
        zkAssert.numeric.notEquals(num, 5);
        return { testNotEquals: num };
      }),
  }));

describe("createZKState", () => {
  it("returns the expected hooks", () => {
    expect(useInitZKStore).toBeDefined();
    expect(useZKStore).toBeDefined();
    expect(useProof).toBeDefined();
    expect(useIsInitialized).toBeDefined();
  });

  it("returns the correct initial global state values", async () => {
    const { result: resLessThan } = renderHook(() =>
      useZKStore((state) => state.testLessThan),
    );
    const { result: resLessThanOrEqual } = renderHook(() =>
      useZKStore((state) => state.testLessThanOrEqual),
    );
    const { result: resGreaterThan } = renderHook(() =>
      useZKStore((state) => state.testGreaterThan),
    );
    const { result: resGreaterThanOrEqual } = renderHook(() =>
      useZKStore((state) => state.testGreaterThanOrEqual),
    );
    const { result: resEquals } = renderHook(() =>
      useZKStore((state) => state.testEquals),
    );
    const { result: resNotEquals } = renderHook(() =>
      useZKStore((state) => state.testNotEquals),
    );

    expect(resLessThan.current).toBe(0);
    expect(resLessThanOrEqual.current).toBe(0);
    expect(resGreaterThan.current).toBe(0);
    expect(resGreaterThanOrEqual.current).toBe(0);
    expect(resEquals.current).toBe(0);
    expect(resNotEquals.current).toBe(0);
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

describe("zkAssert", () => {
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

  it("respects numeric.lessThan assertion", async () => {
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.testLessThan),
    );
    const { result: resSetNum } = renderHook(() =>
      useZKStore((state) => state.setTestLessThan),
    );

    const set = (num: number) =>
      act(() => {
        resSetNum.current(num);
      });

    expect(resNum.current).toBe(0);

    set(4);
    expect(resNum.current).toBe(4);

    set(5);
    expect(resNum.current).toBe(4);

    set(6);
    expect(resNum.current).toBe(4);
  });

  it("respects numeric.lessThanOrEqual assertion", async () => {
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.testLessThanOrEqual),
    );
    const { result: resSetNum } = renderHook(() =>
      useZKStore((state) => state.setTestLessThanOrEqual),
    );

    const set = (num: number) =>
      act(() => {
        resSetNum.current(num);
      });

    expect(resNum.current).toBe(0);

    set(4);
    expect(resNum.current).toBe(4);

    set(5);
    expect(resNum.current).toBe(5);

    set(6);
    expect(resNum.current).toBe(5);
  });

  it("respects numeric.greaterThan assertion", async () => {
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.testGreaterThan),
    );
    const { result: resSetNum } = renderHook(() =>
      useZKStore((state) => state.setTestGreaterThan),
    );

    const set = (num: number) =>
      act(() => {
        resSetNum.current(num);
      });

    expect(resNum.current).toBe(0);

    set(6);
    expect(resNum.current).toBe(6);

    set(5);
    expect(resNum.current).toBe(6);

    set(4);
    expect(resNum.current).toBe(6);
  });

  it("respects numeric.greaterThanOrEqual assertion", async () => {
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.testGreaterThanOrEqual),
    );
    const { result: resSetNum } = renderHook(() =>
      useZKStore((state) => state.setTestGreaterThanOrEqual),
    );

    const set = (num: number) =>
      act(() => {
        resSetNum.current(num);
      });

    expect(resNum.current).toBe(0);

    set(6);
    expect(resNum.current).toBe(6);

    set(5);
    expect(resNum.current).toBe(5);

    set(4);
    expect(resNum.current).toBe(5);
  });

  it("respects numeric.equals assertion", async () => {
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.testEquals),
    );
    const { result: resSetNum } = renderHook(() =>
      useZKStore((state) => state.setTestEquals),
    );

    const set = (num: number) =>
      act(() => {
        resSetNum.current(num);
      });

    expect(resNum.current).toBe(0);

    set(5);
    expect(resNum.current).toBe(5);

    set(6);
    expect(resNum.current).toBe(5);

    set(4);
    expect(resNum.current).toBe(5);
  });

  it("respects numeric.notEquals assertion", async () => {
    const { result: resNum } = renderHook(() =>
      useZKStore((state) => state.testNotEquals),
    );
    const { result: resSetNum } = renderHook(() =>
      useZKStore((state) => state.setTestNotEquals),
    );

    const set = (num: number) =>
      act(() => {
        resSetNum.current(num);
      });

    expect(resNum.current).toBe(0);

    set(4);
    expect(resNum.current).toBe(4);

    set(6);
    expect(resNum.current).toBe(6);

    set(5);
    expect(resNum.current).toBe(6);
  });
});
