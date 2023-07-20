import crypto from "crypto";

export class CipherDecoder {
    private _encoding: BufferEncoding;
    private readonly _algorithms = "aes-256-cbc";

    constructor() {
        this._encoding = "hex";
    }

    static init() {
        return new CipherDecoder();
    }

    withEncoding(encoding: BufferEncoding): CipherDecoder {
        this._encoding = encoding;
        return this;
    }

    decode(token: string, initVector: string, secret: string) {
        const decipher = crypto.createDecipheriv(
            this._algorithms,
            Buffer.from(secret, this._encoding),
            Buffer.from(initVector, this._encoding)
        );

        let decrypted = decipher.update(token, this._encoding, "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
}
