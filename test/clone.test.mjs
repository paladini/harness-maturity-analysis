import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { pinnedClone } from '../corpus/lib/scan.mjs';

const tempRoots = [];
const inheritedGitEnvironment = new Map();
const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8', windowsHide: true }).trim();

beforeEach(() => {
  for (const name of Object.keys(process.env)) {
    if (name.startsWith('GIT_')) {
      inheritedGitEnvironment.set(name, process.env[name]);
      delete process.env[name];
    }
  }
});

afterEach(() => {
  for (const [name, value] of inheritedGitEnvironment) process.env[name] = value;
  inheritedGitEnvironment.clear();
  for (const root of tempRoots.splice(0)) {
    if (!path.resolve(root).startsWith(path.join(tmpdir(), 'harness-clone-'))) {
      throw new Error(`Refusing to clean an unexpected test directory: ${root}`);
    }
    rmSync(root, { recursive: true, force: true });
  }
});

describe('pinned clone integrity', () => {
  it('keeps long paths and repairs an incomplete cached checkout', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'harness-clone-'));
    tempRoots.push(root);
    const source = path.join(root, 'source');
    const dest = path.join(root, 'checkout');
    mkdirSync(source);
    git(source, ['init', '-q']);
    git(source, ['config', 'core.longpaths', 'true']);
    const relative = path.join('fixtures', 'a'.repeat(80), 'b'.repeat(80), 'c'.repeat(80), 'signal.md');
    const sourceFile = path.join(source, relative);
    mkdirSync(path.dirname(sourceFile), { recursive: true });
    writeFileSync(sourceFile, 'tracked fixture\n');
    writeFileSync(path.join(source, '.gitattributes'), '*.bat text eol=crlf\n');
    writeFileSync(path.join(source, 'fixture.bat'), 'echo fixture\r\n');
    git(source, ['add', '.']);
    // Reproduce an upstream commit that stores CRLF despite text normalization.
    const rawBat = git(source, ['hash-object', '-w', '--no-filters', 'fixture.bat']);
    git(source, ['update-index', '--cacheinfo', '100644', rawBat, 'fixture.bat']);
    git(source, [
      '-c',
      'user.name=Test',
      '-c',
      'user.email=test@example.invalid',
      'commit',
      '-qm',
      'fixture',
    ]);
    const sha = git(source, ['rev-parse', 'HEAD']);

    expect(pinnedClone(source, sha, dest).reused).toBe(false);
    expect(git(dest, ['config', 'core.longpaths'])).toBe('true');
    const checkedOutFile = path.join(dest, relative);
    expect(readFileSync(checkedOutFile, 'utf8')).toBe('tracked fixture\n');
    expect(readFileSync(path.join(dest, 'fixture.bat'), 'utf8')).toBe('echo fixture\r\n');
    expect(pinnedClone(source, sha, dest).reused).toBe(true);

    rmSync(checkedOutFile);
    expect(existsSync(checkedOutFile)).toBe(false);
    expect(pinnedClone(source, sha, dest).reused).toBe(false);
    expect(readFileSync(checkedOutFile, 'utf8')).toBe('tracked fixture\n');
    expect(pinnedClone(source, sha, dest).reused).toBe(true);

    writeFileSync(checkedOutFile, 'modified fixture\n');
    expect(pinnedClone(source, sha, dest).reused).toBe(false);
    expect(readFileSync(checkedOutFile, 'utf8')).toBe('tracked fixture\n');
  }, 30_000);
});
