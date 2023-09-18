# zk-states

Verifiable state manager for React based on o1js & Mina protocol.

## Installation

```sh
# using npm
npm install zk-states

# using yarn
yarn add zk-states
```

## Defining a ZK state

`zk-states` requires a web worker in order to execute the heaviest ZK computations. Define a file where the web worker code will run, here we will name it `zkStatesWorker.ts`, but you can use whatever name you prefer. The content of your file should look like this:

```ts
import { initZKWorker } from "zk-states";

initZKWorker();
```

That's it for the worker file!

You define a ZK State in the following way:

```ts
import { createZKAppWorkerClient, createZKAssert, createZKState } from "zk-states";

// replace './zkStatesWorker.ts` with the path to the previously defined web worker
const worker = new Worker(new URL("./zkStatesWorker.ts", import.meta.url), {
  type: "module",
});

const workerClient = createZKAppWorkerClient(worker);

// creating the assertion library, it needs the `workerClient` in order to perform calls to the ZK program
const zkAssert = createZKAssert(workerClient);

interface ZKState {
  num: number;
  incNum: () => void;
}

const { useInitZKStore, useZKStore, useProof, useIsInitialized } =
  createZKState<ZKState>(workerClient, (set) => ({ // zustand state definition https://github.com/pmndrs/zustand
      num: 0,
      incNum: () =>
        set((state) => {
          // This assertion checks the requirements of the specified value.
          // If these requirements are met, the local state will be updated optimistically
          // and the proof generation will be queued in the web worker.
          // The failure of the proof generation will roll back to the previous valid state.
          zkAssert.numeric.lessThanOrEqual(state.num, 5);

          return {
            num: state.num + 1,
          };
        }),
    }),
  );
```

## Configuring your project

ZkStates leverages o1js to enable proof generation in the browser. to enable o1js for the web, we must set the COOP and COEP headers. When using a Vite project we also need to install a plugin to enable topLevelAwait for the web worker.

### Next.js

Open `next.config.js` and make sure you add these two configs.

```ts
const nextConfig = {
 webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      o1js: require('path').resolve('node_modules/o1js')
    };
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  }
};
```

### Vite React.js

add [vite-plugin-top-level-await](https://github.com/Menci/vite-plugin-top-level-await)

```sh
# using npm
npm install vite-plugin-top-level-await

# using yarn
yarn add vite-plugin-top-level-await
```

After installing the Vite plugin open the `vite.config.ts` and add these two entries:

```ts
export default defineConfig({
  plugins: [
    topLevelAwait(),
    {
      name: "isolation",
      configureServer(server) {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
          next();
        });
      },
    },
  ],
});
```

## Deploying the StateVerifier contract

By default, the library connects to an already deployed contract on the berkeley testnet. If you want to deploy your own, run the following command from the root directory:

```sh
DEPLOYER_PRIVATE_KEY=<your_wallet_private_key> MINA_URL=<graphql_mina_url> yarn deploy:zkapp
```

`MINA_URL` env variable is optional and defaults to `https://proxy.berkeley.minaexplorer.com/graphql`

The deployment will take some time. If successfull, it will print out the private and public keys of the newly deployed zkApp. Keep the private key secret!

You can use the public key in the library, to connect to your own deployed contract:

```ts
const { useZKState } = createZKState(workerClient, () => {...}, "berkeley", "<your_zkapp_address>");
```

## Cross-origin isolation

When deploying an application to production, you want to configure your COOP and COEP headers to allow web workers to work properly. [Here](https://github.com/gzuidhof/coi-serviceworker) you can find instructions on how to do the configuration.

If you are using Next.js, you might wanna do the following:

1. Add the `coi-serviceworker` script in the [`public/` directory](https://github.com/o1-labs/docs2/tree/main/examples/zkapps/04-zkapp-browser-ui/ui/public)
2. Write [this init script](https://github.com/o1-labs/docs2/blob/main/examples/zkapps/04-zkapp-browser-ui/ui/src/pages/reactCOIServiceWorker.ts) in your main codebase
3. [Import it](https://github.com/o1-labs/docs2/blob/main/examples/zkapps/04-zkapp-browser-ui/ui/src/pages/_app.page.tsx) in your root component in order to execute it

## Library functions

### `initZKWorker`

`initZKWorker(testRef?: Window & typeof globalThis): void`

Executes the web worker script.

`testRef` param is useful when testing in a non browser environment. Do not use it in development or production. Check out our test files to see how it's being used.

> ⚠️ WARNING: do not import or execute in the main thread, but use it as explained in the example above!

### `createZKAppWorkerClient`

`createZKAppWorkerClient(worker: Worker): ZkAppWorkerClient`

Generates a worker client instance that communicates with the provided web worker. `ZkAppWorkerClient` is used internally and you don't have to interact with it directly.

### `createZKState`

This is the main function of the library, as it generates the hooks that allow you to interact with the library from a React component. It accepts the following parameters:

- `workerClient: ZkAppWorkerClient` - worker client instance generated with `createZKAppWorkerClient` function.
- `createState: StateCreator<T, [], []>` - Zustand state creator function. Refer to [this documentation](https://github.com/pmndrs/zustand#first-create-a-store) for more information on how to define global state with Zustand.
- `networkName: MinaNetwork` - specifies which network to connect to. Defaults to `"berkeley"`.
- `appPublicKeyBase58: string` - specifies the address of the deployed `StatesVerifier` zkApp. Defaults to the address of a `StatesVerifier` zkApp we pre-deployed on the Berkeley testnet. In the previous sections you can find instructions on how to deploy your own zkApp.

The function returns an object containing the hooks documented in [the next section](#hooks).

### `createZKAssert`

Takes the worker client as a param and returns the assertion library. Assertions are functions that will either return `void` when the internal evaluation is successful or will throw a `FailedLocalAssert` error if unsuccessful. Assertions are supposed to be called inside actions defined in `createZKState` state creator, since those are wrapped with a middleware that will handle the thrown error.

If all the assertions called inside an action succeed, they will be sequentially processed by the web worker, which will generate their proofs. If an assertion fails locally, all the other assertions specified in the action will not be submitted to the web worker and the local state won't be updated. If an assertion succeeds locally, but later fails when being proven in the web worker, the local state will automatically rollback to the latest valid state.

To generate the assertion library:

```ts
const zkAssert = createZKAssert(workerClient);
```

To call an assertion:

```ts
// will succeed if `value` is greater than 5 and throw otherwise
zkAssert.numeric.greaterThan(value, 5);
```

Refer to [this section](#defining-a-zk-state) for an example on how to properly call assertions.

## Hooks

### `useZKStore`

Allows you to access the state from a React component.

### `useInitZKStore`

Initializes the zk-store library and connects to Auro wallet. This hook is supposed to be called once per application, possibly in a high level component.

### `useProof`

Returns the latest valid proof.

### `useIsInitialized`

Returns a boolean that indicates if the library has been initialized ot not.

### `useInitializationProgress`

Returns a string that shows the current initialization stage.

### `useQueuedAssertions`

Returns an array containing a stringified representation of the assertions that are waiting to be proven by the web worker.

### `useIsProving`

Returns a boolean that indicates if the web worker is currently generating a proof.

### `useProofFailed`

Returns a boolean that is `true` if the latest web worker proof generation failed.

### `useVerify`

Returns a `verify` function that will call the remote proof verification on the Mina blockchain. User will have to approve the transaction through their wallet.

### `useHasWallet`

Returns a boolean that is `true` if the [Auro Wallet](https://www.aurowallet.com/) extension is installed in the browser.

> ⚠️ IMPORTANT: The extension has to be installed in order to use the library!
