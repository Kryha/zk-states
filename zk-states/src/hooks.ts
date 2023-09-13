import { useCallback, useEffect, useState } from "react";
import { PublicKey } from "o1js";
import { type StateCreator, create } from "zustand";
import { FailedLocalAssert } from "./assertions";
import { useLibStore } from "./store";
import type { MinaNetwork } from "./types";
import { TX_FEE, TX_MEMO, cloneState, logger, wait } from "./utils";
import type { ZkAppWorkerClient } from "./zkAppWorkerClient";

type VerificationStatus = "none" | "pending" | "failure" | "success";

type ZKImpl = <T extends object>(
  storeInitializer: StateCreator<T, [], []>,
  workerClient: ZkAppWorkerClient,
) => StateCreator<T, [], []>;

const zkImpl: ZKImpl = (initializer, workerClient) => (set, get, store) => {
  store.setState = (updater, replace) => {
    try {
      const oldState = cloneState(get());
      set(updater, replace);
      workerClient.proveAction(oldState);
    } catch (error) {
      if (error instanceof FailedLocalAssert) {
        workerClient.clearAssertions();
      }
    }
  };

  return initializer(store.setState, get, store);
};

export const createZKState = <T extends object>(
  workerClient: ZkAppWorkerClient,
  createState: StateCreator<T, [], []>,
  networkName: MinaNetwork = "berkeley",
  appPublicKeyBase58 = "B62qrquKapqyBXxtEBGQTUKLzHeD7xJnxG1qro83HjXhFj7rBiLTuXD",
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
    const resetQueue = useLibStore((state) => state.resetQueue);
    const setProofFailed = useLibStore((state) => state.setProofFailed);
    const setHasWallet = useLibStore((state) => state.setHasWallet);

    const rollback = useZKStore((state) => state.rollback);

    useEffect(() => {
      const init = async () => {
        // TODO: handle worker errors
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

        const proof = await workerClient.init(
          { appPublicKey58: appPublicKeyBase58 },
          () => {},
          (payload) => {
            switch (payload.updateType) {
              case "latestProof": {
                setProof(payload.data);
                break;
              }
              case "updateQueue": {
                setQueuedAssertions(payload.data);
                break;
              }
              case "isProving": {
                setIsProving(payload.data);
                break;
              }
              case "proofError": {
                const oldState = workerClient.getState(payload.callId);
                workerClient.clearHistory();
                rollback(oldState as T);
                resetQueue();
                setProofFailed(true);
                break;
              }
              case "proofSuccess": {
                workerClient.deleteState(payload.callId);
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
      resetQueue,
      rollback,
      setHasWallet,
      setIsProving,
      setProof,
      setProofFailed,
      setQueuedAssertions,
    ]);
  };

  // Couldn't send zkApp command: (Verification_failed ("No verification key found for proved account update" (account_id (B62qkx4PKtUdtn1JrrDw3JKGCAfL1HmXZ484An65n4AqFj1J2UEDNNi 0x0000000000000000000000000000000000000000000000000000000000000001))))
  const useVerify = () => {
    const [verificationStatus, setVerificationStatus] =
      useState<VerificationStatus>("none");

    const assertions = useLibStore((state) => state.queuedAssertions);
    const userPublicKey = useLibStore((state) => state.userPublicKey);
    const isInitialized = useLibStore((state) => state.isInitialized);

    const verify = useCallback(async () => {
      if (!userPublicKey || !isInitialized || !window.mina) return;
      if (assertions.length > 0) return;

      try {
        setVerificationStatus("pending");

        const { transaction } = await workerClient.verify();

        await window.mina.sendTransaction({
          transaction,
          feePayer: { fee: TX_FEE, memo: TX_MEMO },
        });

        setVerificationStatus("success");
      } catch (error) {
        logger.error("Verification error:", error);
        setVerificationStatus("failure");
      }
    }, [assertions.length, isInitialized, userPublicKey]);

    return { verify, verificationStatus };
  };

  const useProof = () => useLibStore((state) => state.proof);
  const useIsInitialized = () => useLibStore((state) => state.isInitialized);
  const useQueuedAssertions = () =>
    useLibStore((state) => state.queuedAssertions);
  const useIsProving = () => useLibStore((state) => state.isProving);
  const useProofFailed = () => useLibStore((state) => state.proofFailed);
  const useHasWallet = () => useLibStore((state) => state.hasWallet);

  return {
    useZKStore,
    useInitZKStore,
    useProof,
    useIsInitialized,
    useQueuedAssertions,
    useIsProving,
    useProofFailed,
    useVerify,
    useHasWallet,
  };
};
