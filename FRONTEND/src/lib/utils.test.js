import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('merges Tailwind classes with tailwind-merge', () => {
    const result = cn('px-4 py-2', 'px-8');
    expect(result).toContain('px-8');
    expect(result).toContain('py-2');
    expect(result).not.toContain('px-4');
  });

  it('handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'end');
    expect(result).toBe('base end');
  });

  it('handles undefined and null', () => {
    const result = cn('base', undefined, null);
    expect(result).toBe('base');
  });

  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });
});
