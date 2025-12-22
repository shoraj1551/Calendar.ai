
import 'dotenv/config';
import dns from 'dns';
import { URL } from 'url';

const run = async () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ DATABASE_URL is not defined in environment.");
        return;
    }

    try {
        const url = new URL(dbUrl);
        const hostname = url.hostname;
        const port = url.port || "5432";

        console.log(`🔍 Diagnosing Connection to: ${hostname}:${port}`);
        console.log(`   (Protocol: ${url.protocol})`);

        console.log("... Attempting DNS Resolution ...");

        dns.lookup(hostname, (err, address, family) => {
            if (err) {
                console.error(`❌ DNS Lookup Failed: ${err.message}`);
                console.error(`   Code: ${err.code}`);
            } else {
                console.log(`✅ DNS Resolved: ${address} (IPv${family})`);
                console.log("\n... Attempting TCP Connectivity check (simulated) ...");
                // We won't open a socket to avoid hanging, but DNS success is a big step.
                // Usually ENOTFOUND fails here.
            }
        });

    } catch (e: any) {
        console.error(`❌ Failed to parse DATABASE_URL: ${e.message}`);
    }
};

run();
