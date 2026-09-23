/**
 * Compiles every pattern's Java template with javac to make sure the lessons
 * never show code that doesn't build. Requires a JDK on PATH.
 *   npm run verify:java
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PATTERNS } from '../shared/patterns/index.ts';

const PRELUDE = `import java.util.*;
import java.util.function.*;
`;
const HELPERS = `
    static class ListNode {
        int val; ListNode next;
        ListNode(int val) { this.val = val; }
    }
    static class TreeNode {
        int val; TreeNode left, right;
        TreeNode(int val) { this.val = val; }
    }
`;

const dir = mkdtempSync(join(tmpdir(), 'dsa-java-'));
try {
  const files: string[] = [];
  for (const p of PATTERNS) {
    const cls = 'Template_' + p.id.replace(/[^a-zA-Z0-9]/g, '_');
    const file = join(dir, `${cls}.java`);
    const body = p.template.code
      .split('\n')
      .map((l) => '    ' + l)
      .join('\n');
    writeFileSync(file, `${PRELUDE}\npublic class ${cls} {${HELPERS}\n${body}\n}\n`);
    files.push(file);
  }
  execFileSync('javac', ['-Xlint:all', '-d', join(dir, 'out'), ...files], { stdio: 'inherit' });
  console.log(`OK: ${files.length} pattern templates compile.`);
} catch {
  console.error('javac failed; see the errors above.');
  process.exitCode = 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
