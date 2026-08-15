import { describe, it, expect } from 'vitest';
import { hashPin, verifyPin } from '../utils/crypto';

describe('Parent PIN Security', () => {
  it('correctly hashes and verifies a 4-digit PIN', () => {
    const pin = '4321';
    const hashed = hashPin(pin);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(pin);
    expect(verifyPin(pin, hashed)).toBe(true);
  });

  it('rejects incorrect PINs', () => {
    const correctPin = '5678';
    const hashed = hashPin(correctPin);

    expect(verifyPin('0000', hashed)).toBe(false);
    expect(verifyPin('1234', hashed)).toBe(false);
    expect(verifyPin('5679', hashed)).toBe(false);
  });

  it('verifies default plain 1234 fallback', () => {
    expect(verifyPin('1234', '1234')).toBe(true);
    expect(verifyPin('9999', '1234')).toBe(false);
  });
});
