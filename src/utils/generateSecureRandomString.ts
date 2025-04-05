import { randomBytes } from "crypto";

export function generateSecureRandomString(length = 16): string {
  return randomBytes(length).toString("hex").slice(0, length);
}
