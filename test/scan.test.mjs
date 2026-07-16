import { describe, expect, it } from 'vitest';
import { parseLsRemoteSymref } from '../corpus/lib/scan.mjs';
import { parseArgs, slugFromUrl } from '../corpus/score-adhoc.mjs';

describe('parseLsRemoteSymref', () => {
  it('extracts branch and SHA from real `git ls-remote --symref` output', () => {
    const output = 'ref: refs/heads/master\tHEAD\n7fd1a60b01f91b314f59955a4e4d4e80d8edf11d\tHEAD\n';
    expect(parseLsRemoteSymref(output)).toEqual({
      branch: 'master',
      sha: '7fd1a60b01f91b314f59955a4e4d4e80d8edf11d',
    });
  });

  it('does not mistake the symref line for the SHA line (regression: both end in "\\tHEAD")', () => {
    const output = 'ref: refs/heads/develop\tHEAD\nabc1230000000000000000000000000000000000\tHEAD\n';
    const { branch, sha } = parseLsRemoteSymref(output);
    expect(branch).toBe('develop');
    expect(sha).toBe('abc1230000000000000000000000000000000000');
    expect(sha.startsWith('ref:')).toBe(false);
  });

  it('returns a null sha for output with no HEAD line, rather than throwing', () => {
    expect(parseLsRemoteSymref('').sha).toBeNull();
    expect(parseLsRemoteSymref('some unrelated text\n').sha).toBeNull();
  });
});

describe('slugFromUrl', () => {
  it('strips protocol and .git suffix, lowercases', () => {
    expect(slugFromUrl('https://github.com/Owner/Repo-Name.git')).toBe('github-com-owner-repo-name');
  });

  it('handles URLs without a .git suffix', () => {
    expect(slugFromUrl('https://github.com/foo/bar')).toBe('github-com-foo-bar');
  });
});

describe('score-adhoc parseArgs', () => {
  it('reads a bare target with defaults for everything else', () => {
    const args = parseArgs(['https://github.com/foo/bar']);
    expect(args.target).toBe('https://github.com/foo/bar');
    expect(args).toMatchObject({
      ref: null,
      subpath: null,
      json: false,
      md: null,
      keep: false,
      compare: true,
    });
  });

  it('parses every option', () => {
    const args = parseArgs([
      'https://github.com/foo/bar',
      '--ref',
      'develop',
      '--subpath',
      'packages/core',
      '--json',
      '--md',
      'out.md',
      '--keep',
      '--no-compare',
    ]);
    expect(args).toMatchObject({
      target: 'https://github.com/foo/bar',
      ref: 'develop',
      subpath: 'packages/core',
      json: true,
      md: 'out.md',
      keep: true,
      compare: false,
    });
  });

  it('sets help and leaves target null when no target is given', () => {
    expect(parseArgs([]).target).toBeNull();
    expect(parseArgs(['--help']).help).toBe(true);
  });

  it('throws on an unrecognized flag', () => {
    expect(() => parseArgs(['--bogus'])).toThrow(/unknown option/);
  });
});
