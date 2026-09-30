/**
 * Characters as numbers. Most string problems quietly depend on a handful of
 * ASCII facts — '0' is 48, 'A' is 65, 'a' is 97, and case is one bit — so the
 * table is generated from real char codes rather than typed out, and the tricks
 * below are the ones that turn up in interview code.
 */

export interface AsciiCell {
  code: number;
  /** What to show: the character itself, or a name for the invisible ones. */
  char: string;
  name?: string;
}

export interface AsciiBlock {
  title: string;
  range: string;
  blurb: string;
  cells: AsciiCell[];
}

const SHOWN_AS: Record<number, [string, string]> = {
  0: ['\\0', 'NUL'],
  9: ['\\t', 'tab'],
  10: ['\\n', 'line feed'],
  13: ['\\r', 'carriage return'],
  32: ['␠', 'space'],
  127: ['DEL', 'delete'],
};

function cells(from: number, to: number): AsciiCell[] {
  const out: AsciiCell[] = [];
  for (let code = from; code <= to; code++) {
    const special = SHOWN_AS[code];
    out.push(special ? { code, char: special[0], name: special[1] } : { code, char: String.fromCharCode(code) });
  }
  return out;
}

const pick = (codes: number[]): AsciiCell[] => codes.flatMap((c) => cells(c, c));

export const ASCII_BLOCKS: AsciiBlock[] = [
  {
    title: 'Digits',
    range: '48–57',
    blurb: "'0' is 48, so a digit's value is c − '0'. The ten digits are consecutive, which is the whole trick.",
    cells: cells(48, 57),
  },
  {
    title: 'Uppercase',
    range: '65–90',
    blurb: "'A' is 65. Uppercase comes BEFORE lowercase, so 'Z' < 'a' — sorting mixed-case strings puts every capital first.",
    cells: cells(65, 90),
  },
  {
    title: 'Lowercase',
    range: '97–122',
    blurb: "'a' is 97, exactly 32 above 'A'. c − 'a' maps a..z onto 0..25, the index into an int[26] counter.",
    cells: cells(97, 122),
  },
  {
    title: 'Whitespace and control',
    range: '0–32, 127',
    blurb: 'Invisible, but they are characters: a string of spaces is not empty, and "\\n" has length 1.',
    cells: pick([0, 9, 10, 13, 32, 127]),
  },
  {
    title: 'Punctuation and symbols',
    range: '33–47, 58–64, 91–96, 123–126',
    blurb: "Scattered in four runs between the letters and digits. Brackets come in pairs that are NOT adjacent codes: '(' 40 and ')' 41 are, but '[' 91 / ']' 93 and '{' 123 / '}' 125 skip one.",
    cells: [...cells(33, 47), ...cells(58, 64), ...cells(91, 96), ...cells(123, 126)],
  },
];

/** The four numbers worth knowing by heart. */
export const ASCII_ANCHORS: { char: string; code: number; why: string }[] = [
  { char: "'0'", code: 48, why: 'digit value is c − 48' },
  { char: "'A'", code: 65, why: 'uppercase starts here' },
  { char: "'a'", code: 97, why: 'lowercase starts here' },
  { char: "' '", code: 32, why: "also the gap between 'A' and 'a'" },
];

export interface CharTrick {
  /** Java, as you'd write it. */
  expr: string;
  /** What it evaluates to, for a concrete example. */
  gives: string;
  note: string;
  /** Tricks that only work on letters, or only on ASCII, say so. */
  caution?: string;
}

export const CHAR_TRICKS: CharTrick[] = [
  { expr: "c - '0'", gives: "'7' → 7", note: 'Parse a digit by hand: how you build a number from a string one character at a time.' },
  { expr: "(char) ('0' + d)", gives: "7 → '7'", note: 'Back from a digit to its character.' },
  { expr: "c - 'a'", gives: "'c' → 2", note: 'Index into int[26] — the fastest counter there is when the input is lowercase letters.' },
  { expr: "(char) ('a' + i)", gives: "2 → 'c'", note: 'Back from an index to its letter, e.g. when building a string from counts.' },
  { expr: "'a' - 'A'", gives: '32', note: 'Upper and lower case are exactly 32 apart — one bit, 0b100000.' },
  { expr: 'c ^ 32', gives: "'a' ↔ 'A'", note: 'Flips that one bit, so it toggles case.', caution: 'Letters only — on a digit or symbol it produces nonsense.' },
  { expr: 'c | 32', gives: "'A' → 'a'", note: 'Sets the bit: lowercases a letter and leaves lowercase alone.', caution: 'Letters only. Character.toLowerCase(c) is the safe version.' },
  { expr: 'c & ~32', gives: "'a' → 'A'", note: 'Clears the bit: uppercases a letter.', caution: "Letters only — it turns '{' into '[' and '1' into an invisible control character." },
  { expr: '(int) c', gives: "'A' → 65", note: 'Widening a char to int gives its code. Arithmetic on chars does this automatically.' },
  { expr: '(char) 65', gives: "'A'", note: 'Narrowing an int back to a char. Needed because char + int is an int.' },
  { expr: "(char) (c + 1)", gives: "'a' → 'b'", note: 'The next character.', caution: "'z' + 1 is '{', not 'a' — wrap-around needs a modulo: (char) ('a' + (c - 'a' + 1) % 26)." },
  { expr: "c >= 'a' && c <= 'z'", gives: 'true for a..z', note: 'The ASCII range check. Fast and explicit.' },
  { expr: 'Character.isLetterOrDigit(c)', gives: "'é' → true", note: 'Unicode-aware: accepts letters from every script. Valid Palindrome uses it to skip punctuation.' },
  { expr: 'Character.getNumericValue(c)', gives: "'7' → 7, 'a' → 10", note: 'Careful: letters come back as 10–35. For plain digits, c − \'0\' is clearer.' },
  { expr: 'String.valueOf(c)', gives: "'a' → \"a\"", note: 'A char is not a String. "" + c works too but allocates the same way.' },
  { expr: 'new int[128]', gives: 'every ASCII char', note: "Size a counter by the alphabet the constraints promise: [26] for lowercase, [128] for ASCII, [256] for extended, a HashMap for anything else." },
];

/** The two facts that bite people who think a char is a byte. */
export const UNICODE_NOTES: string[] = [
  'A Java char is 16 bits (a UTF-16 code unit), not a byte. Anything beyond the first 65,536 code points — most emoji — takes TWO chars, so s.length() counts units, not characters.',
  "If the input can contain emoji, iterate with s.codePoints() instead of charAt(i). LeetCode inputs are almost always ASCII, and the constraints say so — read them.",
];
