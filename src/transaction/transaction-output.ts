import { WalletKeyAgent } from "../utils/wallet-key";

export class UnspentTxOutput {
    constructor(
        public readonly txOutputId: string,
        public readonly txOutputIndex: number,
        public readonly address: string,
        public readonly amount: number
    ) {}
}

export class TransactionOutput {
    constructor(public address: string, public amount: number) {}

    static isValidTxOutStructure(txOut: TransactionOutput): boolean {
        if (!txOut) {
            return false;
        }

        if (typeof txOut.address !== "string") {
            return false;
        }

        const walletKeyAgent = new WalletKeyAgent();
        if (!walletKeyAgent.verifyAddress(txOut.address)) {
            return false;
        }

        if (typeof txOut.amount !== "number") {
            return false;
        }
        return true;
    }
}

export function findUnspentTxOutput(
    txOutputId: string,
    index: number,
    aUnspentTxOuts: UnspentTxOutput[]
): UnspentTxOutput | null {
    return aUnspentTxOuts.find((uTxO) => uTxO.txOutputId === txOutputId && uTxO.txOutputIndex === index) || null;
}

export function createTxOutputList(
    senderAddress: string,
    receiverAddress: string,
    amount: number,
    leftOverAmount: number
): TransactionOutput[] {
    const txOut1: TransactionOutput = new TransactionOutput(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    }

    const leftOverTx = new TransactionOutput(senderAddress, leftOverAmount);
    return [txOut1, leftOverTx];
}

export function findTxOutputForAmount(amount: number, unspentTxOutputList: UnspentTxOutput[]) {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];

    for (const myUnspentTxOut of unspentTxOutputList) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;

        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount;
            return { includedUnspentTxOuts, leftOverAmount };
        }
    }

    throw Error("Cannot create transaction from the available unspent transaction outputs");
}
