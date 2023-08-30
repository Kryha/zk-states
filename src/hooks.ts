import { useEffect } from "react";
import { type StateCreator, create } from "zustand";
import { FailedLocalAssert } from "./assertions";
import { type LibStateVars, useLibStore } from "./store";
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
  const useZKStore = create<T>(zkImpl(createState, workerClient));

  const useInitZKStore = () => {
    const isInitialized = useLibStore((state) => state.isInitialized);

    const setProof = useLibStore((state) => state.setProof);
    const setIsInitialized = useLibStore((state) => state.setIsInitialized);
    const setActionsToProve = useLibStore((state) => state.setActionsToProve);
    const setIsProving = useLibStore((state) => state.setIsProving);
    const rollback = useLibStore((state) => state.rollback);

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
              setActionsToProve(workerRes.data);
              break;
            }
            case "isProving": {
              setIsProving(workerRes.data);
              break;
            }
            case "proofError": {
              const oldState = workerClient.getState(workerRes.callId);
              rollback(oldState as LibStateVars);
              workerClient.clearHistory();
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
      rollback,
      setIsInitialized,
      setIsProving,
      setProof,
      setActionsToProve,
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
