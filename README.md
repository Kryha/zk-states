# zk-states

Verifiable state manager for React based on SnarkyJS & Mina protocol.

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

To define a ZK state, you simply need to call `createZKState`. Here is an example:

```ts
interface ZKState {
  num: number;
  incNum: () => void;
}

const { useInitZkStore, useZKStore, useGetLatestProof } =
  createZKState<ZKState>(
    // replace './zkStatesWorker.ts` with the path to the previously defined web worker
    new Worker(new URL("./zkStatesWorker.ts", import.meta.url),{
      type:"module",
    }),

    // zustand state definition https://github.com/pmndrs/zustand
    (set) => ({
      num: 0,
      incNum: () =>
        set((state) => {
          if (state.num >= 5) return {};

          return {
            num: state.num + 1,
          };
        }),
    }),
    // Define state properties that should trigger proof generation when mutated.
    // You can define assertions in the Actions so that the proofs are generated based only on VALID STATE TRANSITIONS    
    ["num"]
  );
```

## Configuring your project

ZkStates leverages SnarkyJS to enable proof generation in the browser. to enable SnarkyJS for the web, we must set the COOP and COEP headers. When using a Vite project we also need to install a plugin to enable topLevelAwait for the web worker.

### Next.js

Open `next.config.js` and make sure you add these two configs.

```ts
const nextConfig = {
 webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      snarkyjs: require('path').resolve('node_modules/snarkyjs')
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
