export function tryParseJson(str: string): string {
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed === 'object' && 'text' in parsed) {
      return parsed.text;
    }
    return str;
  } catch {
    return str;
  }
}
