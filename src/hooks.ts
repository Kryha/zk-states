import { useEffect } from "react";
import { v4 as uuid } from "uuid";
import { type StateCreator, create } from "zustand";
import { FailedLocalAssert } from "./assertions";
import { globals } from "./globals";
import {
  type LibState,
  type LibStateVars,
  cloneState,
  useLibStore,
} from "./store";
import { wait } from "./utils";
import { ZkAppWorkerClient } from "./zkAppWorkerClient";

type ZKImpl = <T>(
  storeInitializer: StateCreator<T, [], []>,
  workerClient: ZkAppWorkerClient,
) => StateCreator<T, [], []>;

const zkImpl: ZKImpl = (initializer, workerClient) => (set, get, store) => {
  store.setState = (updater, replace) => {
    try {
      set(updater, replace);

      const callId = uuid();

      globals.stateHistory[callId] = cloneState(get() as LibState);

      workerClient.callAssertions({
        callId,
        methods: globals.latestAssertions,
      });
    } catch (error) {
      if (error instanceof FailedLocalAssert) return;
    }
    globals.latestAssertions = [];
  };

  return initializer(store.setState, get, store);
};

export const createZKState = <T extends object>(
  worker: Worker,
  createState: StateCreator<T, [], []>,
) => {
  const zkAppWorkerClient = new ZkAppWorkerClient(worker);

  const useZKStore = create<T>(zkImpl(createState, zkAppWorkerClient));

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

        const { proof } = await zkAppWorkerClient.init({}, (workerRes) => {
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
              const oldState = globals.stateHistory[workerRes.callId];
              globals.stateHistory = {};
              rollback(oldState as LibStateVars);
              break;
            }
            case "proofSuccess": {
              delete globals.stateHistory[workerRes.callId];
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
