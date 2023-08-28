import { useEffect } from "react";
import { type StateCreator, create } from "zustand";
import { FailedLocalAssert } from "./assertions";
import { useContractStore } from "./store";
import { wait } from "./utils";
import type { ZkAppWorkerClient } from "./zkAppWorkerClient";

type ZKImpl = <T>(
  storeInitializer: StateCreator<T, [], []>,
) => StateCreator<T, [], []>;

// TODO: if one assertion fails locally in the action, the following AND PREVIOUS called in the same action should not execute the program
const zkImpl: ZKImpl = (initializer) => (set, get, store) => {
  store.setState = (updater, replace) => {
    try {
      set(updater, replace);
    } catch (error) {
      if (error instanceof FailedLocalAssert) return;
    }
  };

  return initializer(store.setState, get, store);
};

export const createZKState = <T extends object>(
  zkAppWorkerClient: ZkAppWorkerClient,
  createState: StateCreator<T, [], []>,
) => {
  const useZKStore = create<T>(zkImpl(createState));

  const useInitZKStore = () => {
    const isInitialized = useContractStore((state) => state.isInitialized);

    const setProof = useContractStore((state) => state.setProof);
    const setIsInitialized = useContractStore(
      (state) => state.setIsInitialized,
    );
    const setProofsLeft = useContractStore((state) => state.setProofsLeft);
    const setIsProving = useContractStore((state) => state.setIsProving);

    useEffect(() => {
      const init = async () => {
        if (isInitialized) return;

        // TODO: find a better way to wait for the worker
        // waiting so that the worker starts before this gets executed
        await wait(4000);

        const { proof } = await zkAppWorkerClient.init({}, (workerRes) => {
          switch (workerRes.updateType) {
            case "latestProof": {
              setProof(workerRes.data);
              break;
            }
            case "updateQueue": {
              setProofsLeft(workerRes.data);
              break;
            }
            case "isProving": {
              setIsProving(workerRes.data);
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
      setIsInitialized,
      setIsProving,
      setProof,
      setProofsLeft,
    ]);
  };

  const useProof = () => useContractStore((state) => state.proof);
  const useIsInitialized = () =>
    useContractStore((state) => state.isInitialized);

  return {
    useInitZKStore,
    useZKStore,
    useProof,
    useIsInitialized,
  };
};
