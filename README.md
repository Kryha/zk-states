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

<!-- TODO: properly document functions -->
