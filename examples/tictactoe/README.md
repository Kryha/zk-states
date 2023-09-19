# TicTacToe Example project zkStates

This is an Example project that showcases the use of the zKState library.

For every move made on the TicTacToe board a new proof is generated.

## To run the application

```sh
# using yarn
yarn

yarn dev

```

# project structure

The implementation of the library can be found in.
`src/store/index.ts`
In this file a store is created that contains the state of the game and the assertions that can be performed on the state. The store is created using the `createStore` function. This function takes a state object and a list of assertions. The state object is a simple object that contains the state of the game. The assertions are functions that take the state object and return a boolean. The assertions are used to check if the state is valid. The assertions are used to generate the proofs.

When a player won the game and all the proofs are generated the verify button will be enabled. When the verify button is clicked the proofs will be verified. The application will verify the proofs using a zkApp deployed on the Mina Berkley testnet.
