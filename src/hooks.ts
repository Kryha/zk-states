import { useEffect } from "react";
import { type StateCreator, create } from "zustand";
import { useContractStore } from "./store";
import { INITIAL_STATE, wait } from "./utils";
import { ZkAppWorkerClient } from "./zkAppWorkerClient";

let oldState = INITIAL_STATE;

const stringifyState = (state: object) => {
  const stateVariables: Record<string, unknown> = {};
  Object.entries(state).forEach(([key, value]) => {
    if (typeof value !== "function") {
      stateVariables[key] = value;
    }
  });

  const payload = JSON.stringify(stateVariables);

  return payload;
};

export const createZKState = <T extends object>(
  worker: Worker,
  createState: StateCreator<T, [], []>,
) => {
  const useZKStore = create<T>(createState);
  const zkAppWorkerClient = new ZkAppWorkerClient(worker);

  const useInitZkStore = () => {
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

      const newState = stringifyState(state);

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

  return { useInitZkStore, useZKStore, useGetLatestProof };
};
