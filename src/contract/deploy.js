import { Mina, PrivateKey } from 'o1js';
import { z } from 'zod';
import { Assert, StatesVerifier } from './StatesVerifier.js';
const envSchema = z.object({
    MINA_URL: z
        .string()
        .url()
        .default('https://proxy.berkeley.minaexplorer.com/graphql'),
    PRIVATE_KEY: z.string(),
});
const env = envSchema.parse(process.env);
const DEPLOYMENT_FEE = 1000000;
const deploy = async () => {
    const deployerKey = PrivateKey.fromBase58(env.PRIVATE_KEY);
    const deployerAccount = deployerKey.toPublicKey();
    const network = Mina.Network(env.MINA_URL);
    Mina.setActiveInstance(network);
    const zkAppKey = PrivateKey.random();
    const zkAppAddress = zkAppKey.toPublicKey();
    console.log('Compiling program...');
    await Assert.compile();
    console.log('Compiling contract...');
    await StatesVerifier.compile();
    const verifierApp = new StatesVerifier(zkAppAddress);
    console.log('Generating deployment transaction...');
    const deployTx = await Mina.transaction({ fee: DEPLOYMENT_FEE, sender: deployerAccount }, () => {
        verifierApp.deploy({ zkappKey: zkAppKey });
    });
    console.log('Proving deployment transaction...');
    await deployTx.prove();
    deployTx.sign([deployerKey, zkAppKey]);
    console.log('Sending deployment transaction...');
    const sendRes = await deployTx.send();
    if (!sendRes.isSuccess)
        throw new Error('Deployment transaction failed');
    console.log('Contract deployed at address:', zkAppAddress.toBase58());
    console.log('Check the transaction progress in your wallet');
};
deploy();
//# sourceMappingURL=deploy.js.map