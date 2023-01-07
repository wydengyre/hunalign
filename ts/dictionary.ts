export const supportedLanguages = [
  "english",
  "french",
  "italian",
  "spanish",
] as const;
export type Language = typeof supportedLanguages[number];

export function dictionaryFileName(source: Language, target: Language): string {
  // ordering is counterintuitive, for "historic reasons" according to README
  return `${target}-${source}.dic`;
}
