/** Plain-words reading of a relative frequency (100 = the most-reported question at that company). */
export function frequencyLabel(freq: number): string {
  return freq >= 70 ? 'Reported very often' : freq >= 40 ? 'Reported often' : 'Reported sometimes';
}
