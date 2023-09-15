import { StatesVerifier, Assert, AssertProof } from "./StatesVerifier";
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from "o1js";

describe("Assert", () => {
  beforeAll(async () => {
    await Assert.compile();
  });

  const init = async (): Promise<AssertProof> => {
    const initProof = await Assert.init();
    return initProof;
  };

  describe("init", () => {
    it("generates initial proof", async () => {
      const proof = await init();
      expect(proof).toBeDefined();
    });
  });

  describe("fieldEquals", () => {
    it("succeeds on equality", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldEquals(initProof, Field(1), Field(1))
      ).resolves.toBeDefined();
    });

    it("fails on inequality", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldEquals(initProof, Field(1), Field(2))
      ).rejects.toBeDefined();
    });
  });

  describe("fieldNotEquals", () => {
    it("succeeds on inequality", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldNotEquals(initProof, Field(1), Field(2))
      ).resolves.toBeDefined();
    });

    it("fails on equality", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldNotEquals(initProof, Field(1), Field(1))
      ).rejects.toBeDefined();
    });
  });

  describe("fieldGreaterThan", () => {
    it("succeeds when greater than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldGreaterThan(initProof, Field(2), Field(1))
      ).resolves.toBeDefined();
    });

    it("fails when equal to", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldGreaterThan(initProof, Field(1), Field(1))
      ).rejects.toBeDefined();
    });

    it("fails when less than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldGreaterThan(initProof, Field(0), Field(1))
      ).rejects.toBeDefined();
    });
  });

  describe("fieldGreaterThanOrEqual", () => {
    it("succeeds when greater than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldGreaterThanOrEqual(initProof, Field(2), Field(1))
      ).resolves.toBeDefined();
    });

    it("succeeds when equal to", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldGreaterThanOrEqual(initProof, Field(1), Field(1))
      ).resolves.toBeDefined();
    });

    it("fails when less than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldGreaterThanOrEqual(initProof, Field(0), Field(1))
      ).rejects.toBeDefined();
    });
  });

  describe("fieldLessThan", () => {
    it("fails when greater than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldLessThan(initProof, Field(2), Field(1))
      ).rejects.toBeDefined();
    });

    it("fails when equal to", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldLessThan(initProof, Field(1), Field(1))
      ).rejects.toBeDefined();
    });

    it("succeeds when less than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldLessThan(initProof, Field(0), Field(1))
      ).resolves.toBeDefined();
    });
  });

  describe("fieldLessThanOrEqual", () => {
    it("fails when greater than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldLessThanOrEqual(initProof, Field(2), Field(1))
      ).rejects.toBeDefined();
    });

    it("succeeds when equal to", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldLessThanOrEqual(initProof, Field(1), Field(1))
      ).resolves.toBeDefined();
    });

    it("succeeds when less than", async () => {
      const initProof = await init();

      await expect(
        Assert.fieldLessThanOrEqual(initProof, Field(0), Field(1))
      ).resolves.toBeDefined();
    });
  });
});

describe("StatesVerifier", () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: StatesVerifier;

  beforeAll(async () => {
    await Assert.compile();
    await StatesVerifier.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);

    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new StatesVerifier(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it("correctly proves and verifies `Assert` proofs in the `StatesVerifier` contract", async () => {
    await localDeploy();

    const proof = await Assert.init();

    // update transaction
    const txn = await Mina.transaction(senderAccount, () => {
      zkApp.verifyProof(proof);
    });
    await txn.prove();
    const pendingTx = await txn.sign([senderKey]).send();

    await expect(pendingTx.wait()).resolves.not.toThrow();
  });
});
