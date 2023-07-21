import crypto from "crypto";
import { TransactionInput } from "./transaction-input";
import { TransactionOutput, UnspentTxOutput, createTxOutputList, findTxOutputForAmount } from "./transaction-output";
import { WalletKeyAgent } from "../main";

export class Transaction {
    public id: string;
    constructor(public txInputList: TransactionInput[], public txOutputList: TransactionOutput[]) {
        this.id = this.calculateIdHash();
    }

    // Hash transaction id
    calculateIdHash(): string {
        const txInContent: string = this.txInputList
            .map((txIn: TransactionInput) => txIn.txOutputId + txIn.txOutputIndex)
            .reduce((a, b) => a + b, "");

        const txOutContent: string = this.txOutputList
            .map((txOut: TransactionOutput) => txOut.address + txOut.amount)
            .reduce((a, b) => a + b, "");

        const stringToHash = txInContent + txOutContent;
        const hash = crypto.createHash("sha256");
        hash.update(stringToHash);

        return hash.digest().toString("hex");
    }

    static isStructureValid(transaction: Transaction): boolean {
        if (typeof transaction.id !== "string") {
            return false;
        }

        if (!(transaction.txInputList instanceof Array)) {
            return false;
        }
        if (!transaction.txInputList.map(TransactionInput.isStructureValid).reduce((a, b) => a && b, true)) {
            return false;
        }

        if (!(transaction.txOutputList instanceof Array)) {
            return false;
        }

        if (!transaction.txOutputList.map(TransactionOutput.isValidTxOutStructure).reduce((a, b) => a && b, true)) {
            return false;
        }

        return true;
    }

    static createSignTransaction(data: {
        receiver: string;
        amount: number;
        senderPrivate: string;
        unspentTxOutputs: UnspentTxOutput[];
    }): Transaction {
        const { receiver, amount, senderPrivate, unspentTxOutputs } = data;

        const senderAddress: string = new WalletKeyAgent().getPublicAddress(senderPrivate);

        // filter from unspentOutputs such inputs that are referenced in pool
        const { includedUnspentTxOuts, leftOverAmount } = findTxOutputForAmount(amount, unspentTxOutputs);

        const unsignedTxIns: TransactionInput[] = includedUnspentTxOuts.map((unspentTxOut) => {
            const txIn = new TransactionInput(unspentTxOut.txOutputId, unspentTxOut.txOutputIndex, "");
            return txIn;
        });

        const tx: Transaction = new Transaction(
            unsignedTxIns,
            createTxOutputList(senderAddress, receiver, amount, leftOverAmount)
        );

        tx.txInputList = tx.txInputList.map((txIn) => {
            // txIn.signature = txIn.calculateSignature(privateKey, tx.id, unspentTxOuts);
            txIn.signature = txIn.calculateSignature(senderPrivate, tx.id, unspentTxOutputs);
            return txIn;
        });

        return tx;
    }
}
