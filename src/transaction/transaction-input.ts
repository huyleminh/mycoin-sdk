import * as ecdsa from "elliptic";
import { UnspentTxOutput, findUnspentTxOutput } from "./transaction-output";
import { HexaConverter, WalletKeyAgent } from "../utils";

const ec = new ecdsa.ec("secp256k1");

export class TransactionInput {
    constructor(public txOutputId: string, public txOutputIndex: number, public signature: string) {}

    // TODO: check throw exception
    calculateSignature(ownerPrivateKey: string, dataToSign: string, aUnspentTxOuts: UnspentTxOutput[]): string {
        const referencedUnspentTxOut = findUnspentTxOutput(this.txOutputId, this.txOutputIndex, aUnspentTxOuts);

        if (!referencedUnspentTxOut) {
            throw Error("Could not find referenced txOut");
        }
        const referencedAddress = referencedUnspentTxOut.address;

        const walletKeyAgent = new WalletKeyAgent();
        const ownerPublicKey = walletKeyAgent.getPublicAddress(ownerPrivateKey);

        if (ownerPublicKey !== referencedAddress) {
            throw Error(
                "Trying to sign an input with private key that does not match the address that is referenced in txIn"
            );
        }

        const key = ec.keyFromPrivate(ownerPrivateKey, "hex");
        const signature = new HexaConverter().fromByteArray(key.sign(dataToSign).toDER());

        return signature;
    }

    static isStructureValid(txIn: TransactionInput): boolean {
        if (!txIn) {
            return false;
        }

        if (typeof txIn.signature !== "string") {
            return false;
        }

        if (typeof txIn.txOutputId !== "string") {
            return false;
        }

        if (typeof txIn.txOutputIndex !== "number") {
            return false;
        }

        return true;
    }
}
