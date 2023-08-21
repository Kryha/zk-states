import { useEffect } from "react";
import { type StateCreator, create } from "zustand";
import { useContractStore } from "./store";
import { INITIAL_STATE, wait } from "./utils";
import { ZkAppWorkerClient } from "./zkAppWorkerClient";

let oldState = INITIAL_STATE;

const stringifyState = <T extends object>(state: T, toProof: (keyof T)[]) => {
  const stateVariables: Record<string, unknown> = {};
  Object.entries(state).forEach(([key, value]) => {
    if (typeof value !== "function" && toProof.includes(key as keyof T)) {
      stateVariables[key] = value;
    }
  });

  const payload = JSON.stringify(stateVariables);

  return payload;
};

export const createZKState = <T extends object>(
  worker: Worker,
  createState: StateCreator<T, [], []>,
  toProof: (keyof T)[],
) => {
  const useZKStore = create<T>(createState);
  const zkAppWorkerClient = new ZkAppWorkerClient(worker);

  const useInitZKStore = () => {
    const isInitialized = useContractStore((state) => state.isInitialized);

    const setProof = useContractStore((state) => state.setProof);
    const setIsInitialized = useContractStore(
      (state) => state.setIsInitialized,
    );

    const state = useZKStore((state) => state);

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

    useEffect(() => {
      if (!isInitialized) return;

      const newState = stringifyState<T>(state, toProof);

      if (newState === oldState) return;

      oldState = newState;

      void zkAppWorkerClient.transitionState({
        newState,
      });
    }, [isInitialized, state]);
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
