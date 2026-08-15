// Simple fast client-side PIN hashing and validation

export function hashPin(pin: string): string {
  // Simple deterministic djb2 hash + salt for local PIN protection
  let hash = 5381;
  const salted = `capy_pin_${pin.trim()}_stars`;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash * 33) ^ salted.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

export function verifyPin(inputPin: string, storedHash: string): boolean {
  if (!storedHash) return false;
  // If stored as plain '1234' on legacy/default or hashed
  if (storedHash === inputPin.trim()) return true;
  return hashPin(inputPin) === storedHash;
}
