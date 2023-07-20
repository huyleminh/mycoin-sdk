import crypto from "crypto";

export class CipherGenerator {
    private _encoding: BufferEncoding;
    private readonly _algorithms = "aes-256-cbc";
    private readonly _vectorLength = 16;

    private _payload: any;

    constructor() {
        this._encoding = "hex";
    }

    static init() {
        return new CipherGenerator();
    }

    withEncoding(encoding: BufferEncoding): CipherGenerator {
        this._encoding = encoding;
        return this;
    }

    withPayload(payload: any): CipherGenerator {
        this._payload = payload;
        return this;
    }

    sign(secret: string): { iv: string; token: string } {
        const initVector = crypto.randomBytes(this._vectorLength);
        const cipher = crypto.createCipheriv(this._algorithms, Buffer.from(secret, this._encoding), initVector);

        let token = cipher.update(this._payload);
        token = Buffer.concat([token, cipher.final()]);
        return { iv: initVector.toString(this._encoding), token: token.toString(this._encoding) };
    }
}

export class RandomCipherGenerator {
    constructor() {}

    static init() {
        return new RandomCipherGenerator();
    }

    generateRandomBytes(size: number): string {
        const bytes = crypto.randomBytes(size);
        return bytes.toString("hex");
    }
}
