import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export const LocalStorage = {
    // initialize: Create upload folder if missing
    async init() {
        try {
            await mkdir(UPLOAD_DIR, { recursive: true });
        } catch (e) {
            console.error("Failed to create upload dir", e);
        }
    },

    // Save Buffer to Disk
    async upload(fileName: string, buffer: Buffer): Promise<string> {
        await this.init();
        const path = join(UPLOAD_DIR, fileName);
        await writeFile(path, buffer);
        return `/uploads/${fileName}`; // Return public URL
    },

    // Read file
    async get(fileName: string): Promise<Buffer> {
        const path = join(UPLOAD_DIR, fileName);
        return await readFile(path);
    }
};
