import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

/** Encrypts/decrypts a single sensitive value (e.g. an SSN/ITIN submitted by an invited third
 *  party in lib/db-schema.ts's `infoRequests.encryptedValue`) with AES-256-GCM. The key never
 *  leaves the server and the plaintext is only ever decrypted for the verified account owner —
 *  see app/api/info-requests/[id]/reveal/route.ts, the sole caller of `decryptSensitive`. */

function getKey(): Buffer {
  const raw = process.env.SENSITIVE_DATA_KEY
  if (!raw) throw new Error("SENSITIVE_DATA_KEY is not set")
  const key = Buffer.from(raw, "base64")
  if (key.length !== 32) throw new Error("SENSITIVE_DATA_KEY must decode to 32 bytes (openssl rand -base64 32)")
  return key
}

export function encryptSensitive(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString("base64")}.${authTag.toString("base64")}.${ciphertext.toString("base64")}`
}

export function decryptSensitive(encoded: string): string {
  const [ivB64, authTagB64, ciphertextB64] = encoded.split(".")
  if (!ivB64 || !authTagB64 || !ciphertextB64) throw new Error("Malformed encrypted value")
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivB64, "base64"))
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"))
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ciphertextB64, "base64")), decipher.final()])
  return plaintext.toString("utf8")
}
