import 'fake-indexeddb/auto';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API for test environment
class MockAudioContext {
  currentTime = 0;
  state = 'running';
  destination = {};
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
  }
  resume() {
    return Promise.resolve();
  }
}

// Mock Canvas Confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

if (typeof window !== 'undefined') {
  window.AudioContext = MockAudioContext as unknown as typeof AudioContext;
  (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext = MockAudioContext as unknown as typeof AudioContext;
}
