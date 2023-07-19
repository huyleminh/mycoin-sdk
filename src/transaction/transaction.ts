import crypto from "crypto";
import { TransactionInput } from "./transaction-input";
import { TransactionOutput } from "./transaction-output";

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
}
