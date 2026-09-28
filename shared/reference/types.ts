/** Shapes for the reference tab: structures, fundamentals, formulas and the complexity toolbox. */

export interface Cost {
  /** What you're doing, e.g. "get by index" or "insert at front". */
  operation: string;
  /** Big-O, as you'd say it in an interview. */
  cost: string;
  /** Why it costs that, when the number alone doesn't explain it. */
  note?: string;
}

export interface Method {
  /** Java signature, trimmed to what matters. */
  signature: string;
  what: string;
  /** The reason this one is worth memorising. */
  why?: string;
}

export interface Structure {
  id: string;
  name: string;
  group: string;
  /** One line: what it is. */
  summary: string;
  /** When this is the right answer in an interview. */
  useWhen: string[];
  costs: Cost[];
  methods: Method[];
  /** Mistakes that cost people offers. */
  gotchas: string[];
  /** Patterns in this app that lean on it. */
  patterns?: string[];
}

export interface Fundamental {
  id: string;
  title: string;
  group: string;
  /** The rule, stated plainly. */
  rule: string;
  /** Java that shows it, wrong then right where that helps. */
  code?: string;
  /** Why it bites in an interview. */
  matters: string;
}

export interface Formula {
  name: string;
  /** The formula itself, plain text so it reads in a mono font. */
  expression: string;
  /** Where it turns up. */
  useFor: string;
}

export interface FormulaGroup {
  group: string;
  blurb: string;
  formulas: Formula[];
}

export interface Routine {
  name: string;
  /** Time, as you'd claim it. */
  time: string;
  space: string;
  /** The Java call, when the library already has it. */
  call?: string;
  /** What to say about it. */
  note: string;
}

export interface RoutineGroup {
  group: string;
  blurb: string;
  routines: Routine[];
}
