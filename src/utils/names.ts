/**
 * Trims and collapses inner whitespace, as the API does when it stores a
 * name: "  Bernard   12° " -> "Bernard 12°".
 */
export function cleanName(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).join(" ");
}
