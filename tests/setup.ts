import { vi } from 'vitest';
import type { Logger } from '@/types/solver';

export const createMockLogger = (): Logger => {
  return {
    entries: [],
    text: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    step: vi.fn(),
    formula: vi.fn(),
    result: vi.fn(),
    section: vi.fn(),
    separator: vi.fn(),
    table: vi.fn(),
  };
};
