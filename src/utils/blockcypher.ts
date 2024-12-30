import axios from 'axios';
import * as bitcoin from 'bitcoinjs-lib';
import * as secp from 'tiny-secp256k1';
import * as ecpair from 'ecpair';

const API_URL = process.env.API_URL;
const API_TOKEN = process.env.API_TOKEN;

async function getWalletBalanceFunction(address: string): Promise<number | void> {
    try {
        const response = await axios.get(`${API_URL}/addrs/${address}/balance`);
        const balance = response.data.balance;

        return balance;
    } catch (err) {
        console.log(err);
    }
}

async function getWalletFunction(address: string): Promise<any> {
    try {
        const response = await axios.get(`${API_URL}/addrs/${address}`);
        return response.data;
    } catch (err) {
        console.log(err);
    }
}

async function validateAddressFunction(address: string): Promise<boolean> {
    try {
        const response = await axios.get(`${API_URL}/addrs/${address}`);
        return !!response.data;
    } catch {
        return false;
    }
}

async function createWalletFunction(): Promise<{ address: string, private: string } | void> {
    try {
        const response = await axios.post(`${API_URL}/addrs`);
        return response.data;
    } catch (err) {
        console.log(err);
    }
}

async function fundWalletFunction(address: string, balance: number): Promise<boolean | void> {
    try {
        const response = await axios.post(`${API_URL}/faucet?token=${API_TOKEN}`, {
            address,
            amount: balance
        });

        return response.status === 200;
    } catch (err) {
        console.log(err);
    }
}

const sendBTC = async (fromAddress: string, toAddress: string, amount: number, privateKey: string) => {
    try {
        const ECPair = ecpair.ECPairFactory(secp);

        const keyBuffer = Buffer.from(privateKey, 'hex');

        const keys = ECPair.fromPrivateKey(keyBuffer);

        const newtx = {
            inputs: [{ addresses: [fromAddress] }],
            outputs: [{ addresses: [toAddress], value: amount }],
        };

        // Step 1: Create a new transaction
        const response = await axios.post(`${API_URL}/txs/new`, newtx);

        // Step 2: Prepare the transaction for signing
        const tmpTx = response.data;
        tmpTx.pubkeys = [];
        tmpTx.signatures = tmpTx.tosign.map((toSign: string) => {
            // Directly use keys.publicKey, which is a Buffer
            tmpTx.pubkeys.push(Buffer.from(keys.publicKey).toString("hex"));
            return bitcoin.script.signature
                .encode(Buffer.from(keys.sign(Buffer.from(toSign, "hex"))), 0x01)
                .toString("hex")
                .slice(0, -2); // Remove trailing hash type byte
        });

        // Step 3: Send the signed transaction for broadcasting
        const finalResponse = await axios.post(
            `${API_URL}/txs/send`,
            tmpTx
        );

        return {
            total: finalResponse.data.tx.total,
            fees: finalResponse.data.tx.fees,
            hash: finalResponse.data.tx.hash
        } as { total: number, fees: number, hash: string };
    } catch (err) {
        console.error(err);
    }
}

async function confirmTransaction(txHash: string): Promise<{ status: boolean, confirmations?: number, message: string } | void> {
    try {
        const response = await axios.get(`${API_URL}/txs/${txHash}?token=${API_TOKEN}`);
        const confirmations = response.data.confirmations;

        console.log(response.data)

        if (confirmations > 0) {
            return {
                status: true,
                confirmations,
                message: `Transaction confirmed with ${confirmations} confirmations.`,
            };
        } else {
            return {
                status: false,
                message: 'Transaction not yet confirmed.'
            };
        }
    } catch (err) {
        console.error(err);
    }
}

export { getWalletBalanceFunction, validateAddressFunction, createWalletFunction, fundWalletFunction, sendBTC, confirmTransaction, getWalletFunction };