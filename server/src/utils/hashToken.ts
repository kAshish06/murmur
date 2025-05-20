import crypto from "crypto";

export default function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const getRefreshTokenExpiry = (expiryDays: number) =>
  new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);
