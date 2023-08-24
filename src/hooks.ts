import { useEffect } from "react";
import { type StateCreator, create } from "zustand";
import { FailedLocalAssert } from "./assertions";
import { useContractStore } from "./store";
import { wait } from "./utils";
import type { ZkAppWorkerClient } from "./zkAppWorkerClient";

type ZKImpl = <T>(
  storeInitializer: StateCreator<T, [], []>,
) => StateCreator<T, [], []>;

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

    useEffect(() => {
      const init = async () => {
        if (isInitialized) return;

        // TODO: find a better way to wait for the worker
        // waiting so that the worker starts before this gets executed
        await wait(4000);

        const { proof } = await zkAppWorkerClient.init({});

        setIsInitialized(true);
        setProof(proof);
      };
      void init();
    }, [isInitialized, setIsInitialized, setProof]);
  };

  const useGetLatestProof = () => {
    const setProof = useContractStore((state) => state.setProof);

    return () => {
      const latestProof = zkAppWorkerClient.getLatestProof();
      if (latestProof) {
        setProof(latestProof);
      }
      return latestProof;
    };
  };

  const useProof = () => useContractStore((state) => state.proof);
  const useIsInitialized = () =>
    useContractStore((state) => state.isInitialized);

  return {
    useInitZKStore,
    useZKStore,
    useGetLatestProof,
    useProof,
    useIsInitialized,
  };
};
