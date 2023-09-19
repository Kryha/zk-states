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

The ```createZKState``` function allows us to define a global state by specifying values and actions. Actions are functions that will update the state. Before updating the state, we want to make sure that the new values satisfy all the criteria and game rules. This is where assertions come into play. Assertions are functions that will perform a local check on the provided values. If it fails, the assertion will interrupt the action, cancelling the state update. If all the assertions in an action succeed locally, the library will try to recursively generate a ZK proof for each one of these assertions in a worker thread. If one proof generation fails, the state will rollback to the previous valid state. Once the game is finished and all the assertions have been recursively proven, the “Verify” button will allow the player to verify the latest generated proof by calling the ```verify``` function. This function performs a remote call to the verifier deployed on the Mina Berkeley testnet which will check the validity of the latest recursive proof.
