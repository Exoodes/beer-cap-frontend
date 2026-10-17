const dateFormat = new Intl.DateTimeFormat("cs-CZ");

/** "2024-05-03" -> "3. 5. 2024". Read as a local date, so it never shifts a day. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

/** "1 cap", "5 caps". */
export function pluralCaps(count: number): string {
  return `${count} ${count === 1 ? "cap" : "caps"}`;
}
