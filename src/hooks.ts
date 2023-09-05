import { useEffect } from "react";
import { PublicKey } from "snarkyjs";
import { type StateCreator, create } from "zustand";
import { FailedLocalAssert } from "./assertions";
import { useLibStore } from "./store";
import type { MinaNetwork } from "./types";
import { cloneState, wait } from "./utils";
import type { ZkAppWorkerClient } from "./zkAppWorkerClient";

type ZKImpl = <T extends object>(
  storeInitializer: StateCreator<T, [], []>,
  workerClient: ZkAppWorkerClient,
) => StateCreator<T, [], []>;

const zkImpl: ZKImpl = (initializer, workerClient) => (set, get, store) => {
  store.setState = (updater, replace) => {
    try {
      const oldState = cloneState(get());
      set(updater, replace);
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
  networkName: MinaNetwork = "berkeley",
  appPublicKeyBase58: string, // TODO provide default
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
    const initLibStore = useLibStore((state) => state.initLibStore);
    const setQueuedAssertions = useLibStore(
      (state) => state.setQueuedAssertions,
    );
    const setIsProving = useLibStore((state) => state.setIsProving);
    const resetLibState = useLibStore((state) => state.reset);
    const setProofFailed = useLibStore((state) => state.setProofFailed);
    const setHasWallet = useLibStore((state) => state.setHasWallet);

    const rollback = useZKStore((state) => state.rollback);

    useEffect(() => {
      const init = async () => {
        if (isInitialized) return;

        // TODO: find a better way to wait for the worker
        // waiting so that the worker starts before this gets executed
        await wait(4000);

        await workerClient.setMinaNetwork({ networkName });

        if (!window.mina) {
          setHasWallet(false);
          return;
        }

        const userPublicKey58 = (await window.mina.requestAccounts()).at(0);
        if (!userPublicKey58) {
          setHasWallet(false);
          return;
        }
        const userPublicKey = PublicKey.fromBase58(userPublicKey58);

        const fetchAccountRes = await workerClient.fetchAccount({
          publicKey58: userPublicKey58,
        });

        const { proof } = await workerClient.init(
          { appPublicKey58: appPublicKeyBase58 },
          (workerRes) => {
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
                setProofFailed(true);
                break;
              }
              case "proofSuccess": {
                workerClient.deleteState(workerRes.callId);
                setProofFailed(false);
                break;
              }
            }
          },
        );

        initLibStore(proof, userPublicKey, !fetchAccountRes.error);
      };
      void init();
    }, [
      initLibStore,
      isInitialized,
      resetLibState,
      rollback,
      setHasWallet,
      setIsProving,
      setProof,
      setProofFailed,
      setQueuedAssertions,
    ]);
  };

  const useProof = () => useLibStore((state) => state.proof);
  const useIsInitialized = () => useLibStore((state) => state.isInitialized);
  const useQueuedAssertions = () =>
    useLibStore((state) => state.queuedAssertions);
  const useIsProving = () => useLibStore((state) => state.isProving);
  const useProofFailed = () => useLibStore((state) => state.proofFailed);

  return {
    useZKStore,
    useInitZKStore,
    useProof,
    useIsInitialized,
    useQueuedAssertions,
    useIsProving,
    useProofFailed,
  };
};
