import { WalletKeyAgent } from "../utils";

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
