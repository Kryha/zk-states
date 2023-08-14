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
    new Worker(new URL("./zkStatesWorker.ts", import.meta.url)),

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
    })
  );
```

<!-- TODO: properly document functions -->