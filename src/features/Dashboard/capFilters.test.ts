import { describe, expect, it } from "vitest";
import type { BeerCap } from "../../types";
import {
  type CapFilters,
  DEFAULT_FILTERS,
  facetOptions,
  filterAndSortCaps,
  filtersFromParams,
  filtersToParams,
  groupCaps,
  hasActiveFilters,
  hasRatings,
  NO_COUNTRY,
} from "./capFilters";

const CZ = { id: 1, name: "Česká republika" };
const DE = { id: 2, name: "Německo" };

function cap(
  id: number,
  beer: string,
  brand: { id: number; name: string },
  extra: {
    country?: { id: number; name: string } | null;
    rating?: number;
    variant?: string;
    collected?: string;
  } = {},
): BeerCap {
  return {
    id,
    presigned_url: `http://x/${id}.jpg`,
    variant_name: extra.variant ?? null,
    collected_date: extra.collected ?? null,
    beer: {
      id,
      name: beer,
      rating: extra.rating ?? 0,
      beer_brand: brand,
      country: extra.country === undefined ? CZ : extra.country,
    },
  };
}

const BERNARD = { id: 10, name: "Bernard" };
const STAROPRAMEN = { id: 11, name: "Staropramen" };
const SVIJANY = { id: 12, name: "Svijany" };
const CERNA_HORA = { id: 13, name: "Černá Hora" };
const PAULANER = { id: 14, name: "Paulaner" };

const CAPS = [
  cap(1, "Bernard Kvasnicové 11°", BERNARD, { rating: 8 }),
  cap(2, "Bernard 12°", BERNARD, { rating: 6, collected: "2024-05-01" }),
  cap(3, "Staropramen 11°", STAROPRAMEN, { variant: "Červené víčko" }),
  cap(4, "Svijanský Máz", SVIJANY, { rating: 9, collected: "2025-01-10" }),
  cap(5, "Tas", CERNA_HORA),
  cap(6, "Paulaner Weissbier", PAULANER, { country: DE, rating: 7 }),
  cap(7, "Mystery lager", STAROPRAMEN, { country: null }),
];

const ids = (caps: BeerCap[]) => caps.map((c) => c.id);
const run = (filters: Partial<CapFilters>) =>
  ids(filterAndSortCaps(CAPS, { ...DEFAULT_FILTERS, ...filters }));

describe("search", () => {
  it("ignores accents and case", () => {
    expect(run({ q: "KVASNICOVE" })).toEqual([1]);
    expect(run({ q: "cervene" })).toEqual([3]);
  });

  it("matches brand and country names, not only the beer name", () => {
    expect(run({ q: "cerna hora" })).toEqual([5]);
    expect(run({ q: "nemecko" })).toEqual([6]);
  });

  it("requires every word to match, in any order", () => {
    expect(run({ q: "11 bernard" })).toEqual([1]);
    expect(run({ q: "bernard 13" })).toEqual([]);
  });

  it("treats extra whitespace as empty", () => {
    expect(run({ q: "   " })).toHaveLength(CAPS.length);
  });
});

describe("filters", () => {
  it("filters by several countries, including caps without one", () => {
    expect(run({ countries: [String(DE.id), NO_COUNTRY] })).toEqual([7, 6]);
  });

  it("filters by brand", () => {
    expect(run({ brands: [String(STAROPRAMEN.id)] })).toEqual([7, 3]);
  });

  it("filters by rating", () => {
    expect(run({ rating: "7" })).toEqual([6, 4, 1]);
    expect(run({ rating: "unrated" })).toEqual([7, 5, 3]);
  });

  it("combines search and filters", () => {
    expect(run({ q: "11", brands: [String(BERNARD.id)] })).toEqual([1]);
  });
});

describe("sorting", () => {
  it("defaults to recently added", () => {
    expect(run({})).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });

  it("sorts brands in Czech alphabetical order (Č after C, before D)", () => {
    const names = filterAndSortCaps(CAPS, { ...DEFAULT_FILTERS, sort: "brand" })
      .map((c) => c.beer.beer_brand?.name)
      .filter((n, i, all) => all.indexOf(n) === i);
    expect(names).toEqual([
      "Bernard",
      "Černá Hora",
      "Paulaner",
      "Staropramen",
      "Svijany",
    ]);
  });

  it("puts caps without a country last when sorting by country", () => {
    expect(run({ sort: "country" }).at(-1)).toBe(7);
  });

  it("sorts by rating and by collected date, missing values last", () => {
    expect(run({ sort: "rating" }).slice(0, 3)).toEqual([4, 1, 6]);
    expect(run({ sort: "collected" }).slice(0, 2)).toEqual([4, 2]);
  });
});

describe("facetOptions", () => {
  it("lists countries with counts in Czech order", () => {
    expect(facetOptions(CAPS, "country")).toEqual([
      {
        value: "1",
        label: "Česká republika (5)",
        name: "Česká republika",
        count: 5,
      },
      { value: "2", label: "Německo (1)", name: "Německo", count: 1 },
      {
        value: NO_COUNTRY,
        label: "No country (1)",
        name: "No country",
        count: 1,
      },
    ]);
  });

  it("lists brands with counts", () => {
    expect(facetOptions(CAPS, "brand")[0]).toMatchObject({
      value: "10",
      label: "Bernard (2)",
    });
  });
});

describe("URL round trip", () => {
  it("keeps every filter", () => {
    const filters: CapFilters = {
      q: "bernard 11",
      countries: ["1", NO_COUNTRY],
      brands: ["10"],
      rating: "7",
      sort: "brand",
      group: "country",
    };
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it("omits defaults and ignores invalid values", () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe("");
    expect(
      filtersFromParams(new URLSearchParams("sort=evil&rating=11&group=x")),
    ).toEqual(DEFAULT_FILTERS);
  });

  it("detects active filters but not sorting", () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: "name" })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, q: "x" })).toBe(true);
  });
});

describe("groupCaps", () => {
  const sorted = filterAndSortCaps(CAPS, DEFAULT_FILTERS);

  it("keeps one section when not grouping", () => {
    expect(groupCaps(sorted, "none")).toEqual([
      { key: "all", title: "", caps: sorted },
    ]);
  });

  it("groups by country in Czech order, no country last, order kept", () => {
    const groups = groupCaps(sorted, "country");
    expect(groups.map((g) => [g.title, ids(g.caps)])).toEqual([
      ["Česká republika", [5, 4, 3, 2, 1]],
      ["Německo", [6]],
      ["No country", [7]],
    ]);
  });

  it("groups by brewery", () => {
    expect(groupCaps(sorted, "brand").map((g) => g.title)).toEqual([
      "Bernard",
      "Černá Hora",
      "Paulaner",
      "Staropramen",
      "Svijany",
    ]);
  });
});

describe("hasRatings", () => {
  it("is false until some beer is rated", () => {
    expect(hasRatings(CAPS)).toBe(true);
    expect(
      hasRatings(CAPS.map((c) => ({ ...c, beer: { ...c.beer, rating: 0 } }))),
    ).toBe(false);
  });
});
