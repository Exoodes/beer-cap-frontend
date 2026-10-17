// How a cap's page knows its way back: the collection's filters (kept for
// the session) and the order of caps it was opened from (for previous/next).
const SEARCH_KEY = "collection-search";

export function rememberCollectionSearch(search: string): void {
  try {
    sessionStorage.setItem(SEARCH_KEY, search);
  } catch {
    // No storage: "Back" goes to the unfiltered collection.
  }
}

/** The collection as the user last left it, e.g. "/?country=1". */
export function collectionPath(): string {
  try {
    return `/${sessionStorage.getItem(SEARCH_KEY) ?? ""}`;
  } catch {
    return "/";
  }
}

/** Router state a cap's link carries: the ids in the order shown. */
export interface CapListState {
  capIds: number[];
}

export function capIdsFrom(state: unknown): number[] | null {
  const ids = (state as Partial<CapListState> | null)?.capIds;
  return Array.isArray(ids) ? ids : null;
}
