// Text search shared by the dashboard and every searchable dropdown, so
// "plzen" finds "Plzeň" wherever you type it.
import type {
  ComboboxItem,
  ComboboxParsedItem,
  OptionsFilter,
} from "@mantine/core";

/** Czech alphabetical order (Č after C), with numbers compared as numbers. */
export const collator = new Intl.Collator("cs", {
  sensitivity: "base",
  numeric: true,
});

/** Lowercases and strips diacritics, so "kvasnicove" matches "Kvasnicové". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Every word of the query must appear somewhere in the text. */
export function matchesWords(text: string, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalize(text);
  return words.every((word) => haystack.includes(word));
}

/**
 * A Mantine `filter` that matches word by word, ignoring diacritics.
 * `searchTextOf` lets an option be found by more than its label
 * (e.g. a beer by its brand and country).
 */
export function createWordFilter(
  searchTextOf: (item: ComboboxItem) => string = (item) => item.label,
): OptionsFilter {
  const filter: OptionsFilter = ({ options, search, limit }) => {
    const result: ComboboxParsedItem[] = [];
    for (const option of options) {
      if (result.length === limit) break;
      if ("group" in option) {
        const items = filter({
          options: option.items,
          search,
          limit: limit - result.length,
        }) as ComboboxItem[];
        if (items.length) result.push({ group: option.group, items });
      } else if (matchesWords(searchTextOf(option), search)) {
        result.push(option);
      }
    }
    return result;
  };
  return filter;
}

/** Word-by-word, diacritic-insensitive filter on the option label. */
export const wordFilter = createWordFilter();

/**
 * "Gambrinus 10°" rather than "Gambrinus 10° (Gambrinus)": the brand is
 * only added when the name doesn't already contain it.
 */
export function beerLabel(name: string, brand?: string | null): string {
  if (!brand || normalize(name).includes(normalize(brand))) return name;
  return `${name} (${brand})`;
}
