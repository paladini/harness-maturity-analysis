import { describe, expect, it } from 'vitest';
import { parseArgs } from '../corpus/run.mjs';

describe('parseArgs', () => {
  it('defaults to no filter when --only is absent', () => {
    expect(parseArgs([]).only).toBeNull();
  });

  it('parses a single --only name', () => {
    expect(parseArgs(['--only', 'fakeflix']).only).toEqual(new Set(['fakeflix']));
  });

  it('parses a comma-separated --only list', () => {
    expect(parseArgs(['--only', 'a,b,c']).only).toEqual(new Set(['a', 'b', 'c']));
  });

  it('treats a trailing --only with no value as no filter', () => {
    expect(parseArgs(['--only']).only).toBeNull();
  });

  it('enables cache pruning only as an explicit option', () => {
    expect(parseArgs(['--only', 'a,b', '--prune-cache'])).toEqual({
      only: new Set(['a', 'b']),
      pruneCache: true,
    });
    expect(parseArgs([]).pruneCache).toBe(false);
  });
});
