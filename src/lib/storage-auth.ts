import "server-only";

import { createHmac } from "node:crypto";

const TOKEN_LIFETIME = 5 * 60;

export function createStorageToken(userId: string): string {
  const secret = process.env.STORAGE_SECRET;

  if (!secret) {
    throw new Error("STORAGE_SECRET belum dikonfigurasi.");
  }

  if (!userId || userId.length > 255) {
    throw new Error("User ID tidak valid.");
  }

  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME,
    purpose: "academic-storage",
  };

  const payloadEncoded = Buffer.from(
    JSON.stringify(payload),
  ).toString("base64url");

  const signature = createHmac("sha256", secret)
    .update(payloadEncoded)
    .digest("base64url");

  return `${payloadEncoded}.${signature}`;
}
