import crypto from "crypto";

/**
 * Encrypts a sensitive string (such as temporary password) using AES-256-CBC.
 */
export function encryptSecret(plainText: string): string {
  if (!plainText) return "";
  try {
    const secret = process.env.JWT_SECRET || "perfectjodi_jwt_secret_super_secure_key_2026_matrimony";
    const key = crypto.createHash("sha256").update(secret).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(plainText, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("Encryption error:", err);
    return "";
  }
}

/**
 * Decrypts a string encrypted with encryptSecret.
 */
export function decryptSecret(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const secret = process.env.JWT_SECRET || "perfectjodi_jwt_secret_super_secure_key_2026_matrimony";
    const key = crypto.createHash("sha256").update(secret).digest();
    const parts = cipherText.split(":");
    if (parts.length !== 2) return "";
    const iv = Buffer.from(parts[0], "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(parts[1], "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err);
    return "";
  }
}
