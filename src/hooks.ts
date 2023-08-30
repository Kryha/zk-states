import { useEffect } from "react";
import { type StateCreator, create } from "zustand";
import { FailedLocalAssert } from "./assertions";
import { useLibStore } from "./store";
import { cloneState, wait } from "./utils";
import type { ZkAppWorkerClient } from "./zkAppWorkerClient";

type ZKImpl = <T extends object>(
  storeInitializer: StateCreator<T, [], []>,
  workerClient: ZkAppWorkerClient,
) => StateCreator<T, [], []>;

const zkImpl: ZKImpl = (initializer, workerClient) => (set, get, store) => {
  store.setState = (updater, replace) => {
    try {
      set(updater, replace);
      const oldState = cloneState(get());
      workerClient.callAssertions(oldState);
    } catch (error) {
      if (error instanceof FailedLocalAssert) return;
    }
  };

  return initializer(store.setState, get, store);
};

export const createZKState = <T extends object>(
  workerClient: ZkAppWorkerClient,
  createState: StateCreator<T, [], []>,
) => {
  const useZKStore = create<T & { rollback: (oldState: T) => void }>(
    zkImpl(
      (set, get, store) => ({
        ...createState(set, get, store),
        rollback: (oldState: T) => set({ ...oldState }),
      }),
      workerClient,
    ),
  );

  const useInitZKStore = () => {
    const isInitialized = useLibStore((state) => state.isInitialized);

    const setProof = useLibStore((state) => state.setProof);
    const setIsInitialized = useLibStore((state) => state.setIsInitialized);
    const setQueuedAssertions = useLibStore(
      (state) => state.setQueuedAssertions,
    );
    const setIsProving = useLibStore((state) => state.setIsProving);
    const resetLibState = useLibStore((state) => state.reset);

    const rollback = useZKStore((state) => state.rollback);

    useEffect(() => {
      const init = async () => {
        if (isInitialized) return;

        // TODO: find a better way to wait for the worker
        // waiting so that the worker starts before this gets executed
        await wait(4000);

        const { proof } = await workerClient.init((workerRes) => {
          switch (workerRes.updateType) {
            case "latestProof": {
              setProof(workerRes.data);
              break;
            }
            case "updateQueue": {
              setQueuedAssertions(workerRes.data);
              break;
            }
            case "isProving": {
              setIsProving(workerRes.data);
              break;
            }
            case "proofError": {
              const oldState = workerClient.getState(workerRes.callId);
              workerClient.clearHistory();
              rollback(oldState as T);
              resetLibState();
              break;
            }
            case "proofSuccess": {
              workerClient.deleteState(workerRes.callId);
              break;
            }
          }
        });

        setIsInitialized(true);
        setProof(proof);
      };
      void init();
    }, [
      isInitialized,
      resetLibState,
      rollback,
      setQueuedAssertions,
      setIsInitialized,
      setIsProving,
      setProof,
    ]);
  };

  const useProof = () => useLibStore((state) => state.proof);
  const useIsInitialized = () => useLibStore((state) => state.isInitialized);

  return {
    useInitZKStore,
    useZKStore,
    useProof,
    useIsInitialized,
  };
};
