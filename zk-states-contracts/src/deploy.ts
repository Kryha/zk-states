import { AccountUpdate, Mina, PrivateKey, fetchAccount } from 'o1js';
import { z } from 'zod';
import { Assert, StatesVerifier } from './StatesVerifier.js';

const envSchema = z.object({
  MINA_URL: z
    .string()
    .url()
    .default('https://proxy.berkeley.minaexplorer.com/graphql'),
  DEPLOYER_PRIVATE_KEY: z.string(),
  APP_PRIVATE_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

const DEPLOYMENT_FEE = 100_000_000;

const deploy = async () => {
  const network = Mina.Network(env.MINA_URL);
  Mina.setActiveInstance(network);

  const deployerKey = PrivateKey.fromBase58(env.DEPLOYER_PRIVATE_KEY);
  const deployerAddress = deployerKey.toPublicKey();

  console.log('Fetching deployer account...');
  let fetchAccountRes = await fetchAccount({ publicKey: deployerAddress });

  if (fetchAccountRes.error) throw Error(fetchAccountRes.error.statusText);

  const { nonce, balance } = fetchAccountRes.account;

  console.log(
    `Using fee payer account with nonce ${nonce}, balance ${balance}`
  );

  const zkAppKey = env.APP_PRIVATE_KEY
    ? PrivateKey.fromBase58(env.APP_PRIVATE_KEY)
    : PrivateKey.random();
  const zkAppAddress = zkAppKey.toPublicKey();

  console.log('Compiling program...');
  await Assert.compile();

  console.log('Compiling contract...');
  const { verificationKey } = await StatesVerifier.compile();

  const verifierApp = new StatesVerifier(zkAppAddress);

  console.log('Generating deployment transaction...');
  const deployTx = await Mina.transaction(
    { fee: DEPLOYMENT_FEE, sender: deployerAddress },
    () => {
      AccountUpdate.fundNewAccount(deployerAddress);
      verifierApp.deploy({ verificationKey });
    }
  );

  console.log('Proving deployment transaction...');
  await deployTx.prove();
  deployTx.sign([deployerKey, zkAppKey]);

  console.log('Sending deployment transaction...');
  const sendRes = await deployTx.send();
  if (!sendRes.isSuccess) throw new Error('Deployment transaction failed');

  console.log('Waiting for transaction to complete...');
  await sendRes.wait();

  console.log('Contract deployed at address:', zkAppAddress.toBase58());
  console.log('Contract private key is:', zkAppKey.toBase58());
  console.log('Check the transaction progress in your wallet');
};

deploy();
