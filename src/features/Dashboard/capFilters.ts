// Dashboard search, filtering and sorting. Pure functions over the cap list,
// with the filter state stored in the URL query string.
import type { BeerCap } from "../../types";
import { matchesWords } from "../../utils/search";

export const SORT_OPTIONS = [
  { value: "recent", label: "Recently added" },
  { value: "name", label: "Beer name (A–Z)" },
  { value: "brand", label: "Brand (A–Z)" },
  { value: "country", label: "Country (A–Z)" },
  { value: "rating", label: "Rating (best first)" },
  { value: "collected", label: "Collected (newest first)" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const RATING_OPTIONS = [
  { value: "unrated", label: "Unrated" },
  { value: "5", label: "5+" },
  { value: "7", label: "7+" },
  { value: "9", label: "9+" },
] as const;

export type RatingFilter = (typeof RATING_OPTIONS)[number]["value"] | null;

export const GROUP_OPTIONS = [
  { value: "none", label: "All" },
  { value: "country", label: "Country" },
  { value: "brand", label: "Brewery" },
] as const;

export type GroupKey = (typeof GROUP_OPTIONS)[number]["value"];

/** Facet value for caps whose beer has no country. */
export const NO_COUNTRY = "none";

export interface CapFilters {
  q: string;
  countries: string[];
  brands: string[];
  rating: RatingFilter;
  sort: SortKey;
  group: GroupKey;
}

export const DEFAULT_FILTERS: CapFilters = {
  q: "",
  countries: [],
  brands: [],
  rating: null,
  sort: "recent",
  group: "none",
};

const collator = new Intl.Collator("cs", {
  sensitivity: "base",
  numeric: true,
});

function searchText(cap: BeerCap): string {
  return [
    cap.beer.name,
    cap.beer.beer_brand?.name,
    cap.beer.country?.name,
    cap.variant_name,
  ]
    .filter(Boolean)
    .join(" ");
}

function countryKey(cap: BeerCap): string {
  return cap.beer.country ? String(cap.beer.country.id) : NO_COUNTRY;
}

function brandKey(cap: BeerCap): string {
  return cap.beer.beer_brand ? String(cap.beer.beer_brand.id) : "";
}

function matchesRating(rating: number, filter: RatingFilter): boolean {
  if (filter === null) return true;
  if (filter === "unrated") return rating === 0;
  return rating >= Number(filter);
}

const byText = (get: (cap: BeerCap) => string | undefined | null) => {
  return (a: BeerCap, b: BeerCap) => {
    const x = get(a);
    const y = get(b);
    // Caps missing the value go last.
    if (!x || !y) return x ? -1 : y ? 1 : 0;
    return collator.compare(x, y);
  };
};

const COMPARATORS: Record<SortKey, (a: BeerCap, b: BeerCap) => number> = {
  recent: (a, b) => b.id - a.id,
  name: byText((c) => c.beer.name),
  brand: byText((c) => c.beer.beer_brand?.name),
  country: byText((c) => c.beer.country?.name),
  rating: (a, b) => (b.beer.rating ?? 0) - (a.beer.rating ?? 0),
  // ISO dates sort lexically; undated caps go last.
  collected: (a, b) =>
    (b.collected_date ?? "").localeCompare(a.collected_date ?? ""),
};

/** Applies the filters; every search word must match somewhere on the cap. */
export function filterAndSortCaps(
  caps: BeerCap[],
  filters: CapFilters,
): BeerCap[] {
  const countries = new Set(filters.countries);
  const brands = new Set(filters.brands);

  const result = caps.filter((cap) => {
    if (countries.size && !countries.has(countryKey(cap))) return false;
    if (brands.size && !brands.has(brandKey(cap))) return false;
    if (!matchesRating(cap.beer.rating ?? 0, filters.rating)) return false;
    if (filters.q && !matchesWords(searchText(cap), filters.q)) return false;
    return true;
  });

  const compare = COMPARATORS[filters.sort];
  // Ties fall back to newest first, so the order is stable.
  return result.sort((a, b) => compare(a, b) || b.id - a.id);
}

export interface FacetOption {
  value: string;
  /** "Německo (8)", for dropdowns. */
  label: string;
  name: string;
  count: number;
}

/** Country/brand options present in the collection, with cap counts. */
export function facetOptions(
  caps: BeerCap[],
  facet: "country" | "brand",
): FacetOption[] {
  const counts = new Map<string, { name: string; count: number }>();
  for (const cap of caps) {
    const value = facet === "country" ? countryKey(cap) : brandKey(cap);
    if (!value) continue;
    const name =
      facet === "country"
        ? (cap.beer.country?.name ?? "No country")
        : (cap.beer.beer_brand?.name ?? "");
    const entry = counts.get(value) ?? { name, count: 0 };
    entry.count += 1;
    counts.set(value, entry);
  }
  return [...counts.entries()]
    .sort(([, a], [, b]) => collator.compare(a.name, b.name))
    .map(([value, { name, count }]) => ({
      value,
      label: `${name} (${count})`,
      name,
      count,
    }));
}

/** Whether any beer has a rating; until then rating filters are hidden. */
export function hasRatings(caps: BeerCap[]): boolean {
  return caps.some((cap) => (cap.beer.rating ?? 0) > 0);
}

export interface CapGroup {
  key: string;
  /** Empty when not grouping. */
  title: string;
  caps: BeerCap[];
}

/**
 * Splits the (already sorted) caps into sections by country or brewery,
 * in alphabetical order with "No country" last. Order inside a section
 * is kept.
 */
export function groupCaps(caps: BeerCap[], group: GroupKey): CapGroup[] {
  if (group === "none") return [{ key: "all", title: "", caps }];

  const groups = new Map<string, CapGroup>();
  for (const cap of caps) {
    const key = group === "country" ? countryKey(cap) : brandKey(cap);
    const title =
      group === "country"
        ? (cap.beer.country?.name ?? "No country")
        : (cap.beer.beer_brand?.name ?? "No brand");
    const section = groups.get(key) ?? { key, title, caps: [] };
    section.caps.push(cap);
    groups.set(key, section);
  }
  const last = (key: string) => (key === NO_COUNTRY || key === "" ? 1 : 0);
  return [...groups.values()].sort(
    (a, b) => last(a.key) - last(b.key) || collator.compare(a.title, b.title),
  );
}

export function hasActiveFilters(filters: CapFilters): boolean {
  return (
    filters.q.trim() !== "" ||
    filters.countries.length > 0 ||
    filters.brands.length > 0 ||
    filters.rating !== null
  );
}

const isSortKey = (v: string | null): v is SortKey =>
  SORT_OPTIONS.some((o) => o.value === v);
const isRating = (v: string | null): v is Exclude<RatingFilter, null> =>
  RATING_OPTIONS.some((o) => o.value === v);
const isGroup = (v: string | null): v is GroupKey =>
  GROUP_OPTIONS.some((o) => o.value === v);

export function filtersFromParams(params: URLSearchParams): CapFilters {
  const sort = params.get("sort");
  const rating = params.get("rating");
  const group = params.get("group");
  return {
    q: params.get("q") ?? "",
    countries: params.getAll("country"),
    brands: params.getAll("brand"),
    rating: isRating(rating) ? rating : null,
    sort: isSortKey(sort) ? sort : DEFAULT_FILTERS.sort,
    group: isGroup(group) ? group : DEFAULT_FILTERS.group,
  };
}

/** Only non-default values are written, to keep URLs short. */
export function filtersToParams(filters: CapFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  for (const c of filters.countries) params.append("country", c);
  for (const b of filters.brands) params.append("brand", b);
  if (filters.rating) params.set("rating", filters.rating);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.group !== DEFAULT_FILTERS.group) {
    params.set("group", filters.group);
  }
  return params;
}
