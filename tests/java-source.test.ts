import { describe, expect, it } from 'vitest';
import { methodsForLeetCode } from '../shared/java-source.ts';

describe('methodsForLeetCode', () => {
  it('unwraps the class and drops imports, ready to paste inside theirs', () => {
    const code = `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        return new int[0];
    }
}`;
    expect(methodsForLeetCode(code)).toBe(`    public int[] twoSum(int[] nums, int target) {
        return new int[0];
    }`);
  });

  it('keeps helper methods and fields', () => {
    const code = `class Solution {
    private int count = 0;

    public int solve(int n) {
        return helper(n);
    }

    private int helper(int n) {
        return n * 2;
    }
}`;
    const out = methodsForLeetCode(code);
    expect(out).toContain('private int count = 0;');
    expect(out).toContain('private int helper(int n) {');
    expect(out.startsWith('    private int count')).toBe(true);
  });

  it('is not fooled by braces inside strings, chars or comments', () => {
    const code = `class Solution {
    public String f() {
        // a stray } in a comment
        char c = '}';
        return "not } the end";
    }
}
class Leftover { }`;
    const out = methodsForLeetCode(code);
    expect(out).toContain('return "not } the end";');
    expect(out).toContain('class Leftover');
    expect(out.indexOf('class Leftover')).toBeGreaterThan(out.indexOf('return "not'));
  });

  it('brings a helper class along but not one LeetCode already defines', () => {
    const code = `class Solution {
    public int f() { return 1; }
}

class Pair {
    int a, b;
}

class ListNode {
    int val;
    ListNode next;
}`;
    const out = methodsForLeetCode(code);
    expect(out).toContain('class Pair {');
    expect(out).not.toContain('class ListNode');
  });

  it('prefers Solution even when another class is declared first', () => {
    const code = `class Pair { int a; }

class Solution {
    public int f() { return 1; }
}`;
    expect(methodsForLeetCode(code).startsWith('    public int f()')).toBe(true);
  });

  it('handles a design-class problem, where the class itself is the answer', () => {
    const code = `class LRUCache {
    public LRUCache(int capacity) { }

    public int get(int key) { return -1; }
}`;
    const out = methodsForLeetCode(code);
    expect(out).toContain('public LRUCache(int capacity)');
    expect(out).toContain('public int get(int key)');
    expect(out).not.toContain('class LRUCache');
  });

  it('normalises tabs and odd indentation to four spaces', () => {
    const code = 'class Solution {\n\t\tpublic int f() {\n\t\t\treturn 1;\n\t\t}\n}';
    expect(methodsForLeetCode(code)).toBe('    public int f() {\n        return 1;\n    }');
  });

  it('hands back what it was given when there is no class or the braces are broken', () => {
    expect(methodsForLeetCode('int x = 1;')).toBe('int x = 1;');
    expect(methodsForLeetCode('class Solution {\n  public void f() {')).toContain('public void f() {');
    expect(methodsForLeetCode('')).toBe('');
  });

  it('strips a package declaration too', () => {
    expect(methodsForLeetCode('package foo;\nclass Solution { public int f() { return 1; } }')).not.toContain('package');
  });
});
