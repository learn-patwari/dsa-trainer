import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

const dataDir = mkdtempSync(join(tmpdir(), 'dsa-store-'));
process.env.DSA_DATA_DIR = dataDir;

const { DATA_DIR, listBackups, readProgress, resetProgress, restoreBackup, updateProgress } = await import('../server/store.ts');

const file = join(dataDir, 'progress.json');

afterAll(() => {
  delete process.env.DSA_DATA_DIR;
});

describe('where the data lives', () => {
  it('honours DSA_DATA_DIR, and otherwise sits beside the code rather than the working directory', () => {
    expect(DATA_DIR).toBe(dataDir);
    // The default is resolved from the module, so `npm start` from another folder
    // finds the same progress instead of a new empty one.
    const source = readFileSync(new URL('../server/store.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('process.cwd()');
    expect(source).toContain('fileURLToPath(import.meta.url)');
  });
});

describe('durability', () => {
  it('writes every change straight to disk', async () => {
    await updateProgress((p) => {
      p.ratings.hashing = 1300;
    });
    expect(JSON.parse(readFileSync(file, 'utf8')).ratings.hashing).toBe(1300);
  });

  it('notices the file changing underneath it instead of overwriting the newer copy', async () => {
    await updateProgress((p) => {
      p.ratings.hashing = 1300;
    });

    // Stand in for a second server process, or a restore, writing the file.
    const outside = JSON.parse(readFileSync(file, 'utf8'));
    outside.ratings.greedy = 1550;
    outside.mtimeNudge = Date.now();
    writeFileSync(file, JSON.stringify(outside));

    // The next read must see the other writer's work, not the stale cached copy.
    expect((await readProgress()).ratings.greedy).toBe(1550);

    // And the next write must preserve it.
    await updateProgress((p) => {
      p.ratings.trie = 1200;
    });
    const onDisk = JSON.parse(readFileSync(file, 'utf8'));
    expect(onDisk.ratings).toMatchObject({ hashing: 1300, greedy: 1550, trie: 1200 });
  });
});

describe('backups', () => {
  it('copies the old progress aside before a reset, and can put it back', async () => {
    await updateProgress((p) => {
      p.ratings.hashing = 1421;
      p.problems['two-sum'] = { attempts: 2, bestPercent: 90, lastPercent: 90, lastAt: new Date().toISOString() };
    });

    const backup = await resetProgress();
    expect(backup, 'reset should name the copy it took').toBeTruthy();
    expect((await readProgress()).ratings.hashing).toBeUndefined();

    const list = await listBackups();
    expect(list.some((b) => b.name === backup)).toBe(true);
    expect(list.find((b) => b.name === backup)!.reason).toBe('before-reset');

    const restored = await restoreBackup(backup!);
    expect(restored.ratings.hashing).toBe(1421);
    expect(restored.problems['two-sum']!.attempts).toBe(2);
    expect((await readProgress()).ratings.hashing).toBe(1421);
  });

  it('copies aside before a restore too, so a restore is reversible', async () => {
    await updateProgress((p) => {
      p.ratings.greedy = 1600;
    });
    const before = await listBackups();
    const target = before.find((b) => b.reason === 'before-reset')!;

    await restoreBackup(target.name);
    const after = await listBackups();
    expect(after.some((b) => b.reason === 'before-restore')).toBe(true);
    expect(after.length).toBeGreaterThan(before.length);
  });

  it('refuses a name that is not a backup', async () => {
    await expect(restoreBackup('../../etc/passwd')).rejects.toThrow(/not a backup file name/i);
    await expect(restoreBackup('progress-nope.json')).rejects.toThrow();
  });

  it('lists newest first', async () => {
    const list = await listBackups();
    const times = list.map((b) => b.at);
    expect(times).toEqual([...times].sort().reverse());
  });
});
