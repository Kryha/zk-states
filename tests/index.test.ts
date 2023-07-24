import { PrivateKey } from "snarkyjs";
import { createZKState } from "zk-state";

it("creates contract", async () => {
  const { Add } = await import("./contracts/Add");
  expect(Add).toBeDefined();

  const privateKey = PrivateKey.random();

  const add = new Add(privateKey.toPublicKey());

  createZKState(add);
});
