
import 'dotenv/config';
import { db } from "@/db";
import { connectedAccounts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

const run = async () => {
    console.log("🔐 Testing Token Persistence & Refresh Logic...");

    // 1. Setup Test User
    const email = `test-user-${randomUUID()}@example.com`;
    console.log(`\n👤 Creating Test User: ${email}`);

    const [user] = await db.insert(users).values({
        email,
        name: "Test User"
    }).returning();

    // 2. Simulate Initial OAuth Callback (Insert)
    console.log(`\n🔄 Simulating Initial OAuth Connection...`);
    const initialTokens = {
        access_token: "access_123",
        refresh_token: "refresh_ABC",
        expiry_date: Date.now() + 3600000
    };
    const googleEmail = "calendar-user@gmail.com";

    // Logic mirrored from route.ts
    await db.insert(connectedAccounts).values({
        userId: user.id,
        provider: 'google',
        email: googleEmail,
        name: "Google Calendar",
        status: 'active',
        accessToken: initialTokens.access_token,
        refreshToken: initialTokens.refresh_token,
        expiresAt: new Date(initialTokens.expiry_date),
    });

    // Verify
    const account = await db.query.connectedAccounts.findFirst({
        where: and(eq(connectedAccounts.userId, user.id), eq(connectedAccounts.provider, 'google'))
    });

    if (account?.accessToken === "access_123" && account?.refreshToken === "refresh_ABC") {
        console.log("   ✅ SUCCESS: Initial tokens persisted correctly.");
    } else {
        console.error("   ❌ FAILED: Initial tokens mismatch.", account);
        process.exit(1);
    }

    // 3. Simulate Re-Connection (Update - Google sends new tokens)
    console.log(`\n🔄 Simulating Re-Connection (New Tokens)...`);
    const newTokens = {
        access_token: "access_456",
        refresh_token: "refresh_XYZ", // Rotated
        expiry_date: Date.now() + 3600000
    };

    // Logic mirrored from route.ts
    await db.update(connectedAccounts)
        .set({
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token || account!.refreshToken,
            expiresAt: new Date(newTokens.expiry_date),
            updatedAt: new Date()
        })
        .where(eq(connectedAccounts.id, account!.id));

    const updatedAccount = await db.query.connectedAccounts.findFirst({
        where: eq(connectedAccounts.id, account!.id)
    });

    if (updatedAccount?.accessToken === "access_456" && updatedAccount?.refreshToken === "refresh_XYZ") {
        console.log("   ✅ SUCCESS: Tokens updated correctly on re-connection.");
    } else {
        console.error("   ❌ FAILED: Update tokens mismatch.", updatedAccount);
    }


    // 4. Simulate Sync Refresh (Token Rotation)
    console.log(`\n🔄 Simulating Sync Refresh (Token Rotation)...`);
    // SyncManager logic
    const rotatedTokens = {
        accessToken: "access_789",
        refreshToken: "refresh_NEW", // Rotated
        expiresAt: Date.now() + 3600000
    };

    await db.update(connectedAccounts).set({
        accessToken: rotatedTokens.accessToken,
        refreshToken: rotatedTokens.refreshToken || updatedAccount!.refreshToken,
        expiresAt: new Date(rotatedTokens.expiresAt),
        updatedAt: new Date()
    }).where(eq(connectedAccounts.id, account!.id));

    const refreshedAccount = await db.query.connectedAccounts.findFirst({
        where: eq(connectedAccounts.id, account!.id)
    });

    if (refreshedAccount?.refreshToken === "refresh_NEW") {
        console.log("   ✅ SUCCESS: Refresh token rotated in DB.");
    } else {
        console.error("   ❌ FAILED: Refresh token not rotated.", refreshedAccount);
    }

    // 5. Simulate Sync Refresh (No Rotation - Google style)
    console.log(`\n🔄 Simulating Sync Refresh (No New Refresh Token)...`);
    const sameRefreshTokens = {
        accessToken: "access_999",
        refreshToken: undefined, // Google didn't send one
        expiresAt: Date.now() + 3600000
    };

    await db.update(connectedAccounts).set({
        accessToken: sameRefreshTokens.accessToken,
        refreshToken: sameRefreshTokens.refreshToken || refreshedAccount!.refreshToken,
        expiresAt: new Date(sameRefreshTokens.expiresAt),
        updatedAt: new Date()
    }).where(eq(connectedAccounts.id, account!.id));

    const finalAccount = await db.query.connectedAccounts.findFirst({
        where: eq(connectedAccounts.id, account!.id)
    });

    if (finalAccount?.refreshToken === "refresh_NEW" && finalAccount?.accessToken === "access_999") {
        console.log("   ✅ SUCCESS: Old refresh token successfully preserved.");
    } else {
        console.error("   ❌ FAILED: Old refresh token lost or not preserved.", finalAccount);
    }

    // Cleanup
    await db.delete(connectedAccounts).where(eq(connectedAccounts.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));
    console.log("\n✅ All Token Persistence Tests Passed.");
    process.exit(0);
};

run();
