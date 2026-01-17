import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";
// CRITICAL: Encryption key MUST be set in production
const KEY = process.env.ENCRYPTION_KEY;
if (!KEY) {
    throw new Error('ENCRYPTION_KEY environment variable must be set');
}
if (KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters');
}

const IV_LENGTH = 16;


export const EncryptionUtils = {
    encrypt(text: string): string {
        const iv = randomBytes(IV_LENGTH);
        const cipher = createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    },

    decrypt(text: string): string {
        const textParts = text.split(":");
        const iv = Buffer.from(textParts.shift()!, "hex");
        const encryptedText = Buffer.from(textParts.join(":"), "hex");
        const decipher = createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }
};
