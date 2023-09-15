import {
  createZKState,
  createZKAssert,
  createZKAppWorkerClient,
} from "zk-states";

const worker = new Worker(new URL("./zkStateWorker.ts", import.meta.url), {
  type: "module",
});

const workerClient = createZKAppWorkerClient(worker);
const zkAssert = createZKAssert(workerClient);

interface ZKState {
  num: number;
  setNum: (num: number) => void;
}

const {
  useZKStore,
  useInitZKStore,
  useProof,
  useIsInitialized,
  useInitializationProgress,
  useQueuedAssertions,
  useIsProving,
  useProofFailed,
  useHasWallet,
  useVerify,
} = createZKState<ZKState>(workerClient, (set) => ({
  num: 0,
  setNum: (num) =>
    set(() => {
      zkAssert.numeric.greaterThanOrEqual(num, 0);
      zkAssert.numeric.lessThanOrEqual(num, 2);

      return { num };
    }),
}));

const CustomComponentLib = () => {
  const num = useZKStore((state) => state.num);
  const setNum = useZKStore((state) => state.setNum);

  const isInitialized = useIsInitialized();
  const proof = useProof();
  const asssertions = useQueuedAssertions();
  const isProving = useIsProving();
  const proofFailed = useProofFailed();
  const hasWallet = useHasWallet();
  const { verificationStatus, verify } = useVerify();
  const initProgress = useInitializationProgress();

  useInitZKStore();

  if (!hasWallet) return <p>No wallet found</p>;

  if (!isInitialized) return <p>{initProgress}</p>;

  return (
    <div>
      <p>Queued assertions: {asssertions.length}</p>
      <p>Is proving: {isProving}</p>
      <p>Has wallet: {hasWallet}</p>
      {proofFailed && <p>Proof generation failed</p>}

      <p>Num: {num}</p>

      <button onClick={() => setNum(1)}>Set 1</button>
      <button onClick={() => setNum(2)}>Set 2</button>
      <button onClick={() => setNum(3)}>Set 3</button>

      {proof && <p>{proof.proof}</p>}

      <p>Verification status: {verificationStatus}</p>
      <p>Initialization progress: {initProgress}</p>
      <button
        disabled={verificationStatus === "pending" || asssertions.length > 0}
        onClick={() => void verify()}
      >
        Verify
      </button>
    </div>
  );
};

export default CustomComponentLib;
