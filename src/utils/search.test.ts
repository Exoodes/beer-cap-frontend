import type { ComboboxItem } from "@mantine/core";
import { describe, expect, it } from "vitest";
import {
  beerLabel,
  createWordFilter,
  matchesWords,
  normalize,
  wordFilter,
} from "./search";

describe("normalize", () => {
  it("strips diacritics and lowercases", () => {
    expect(normalize("Kvasnicové Černá ŽLUŤOUČKÝ")).toBe(
      "kvasnicove cerna zlutoucky",
    );
  });
});

describe("matchesWords", () => {
  it("ignores diacritics and case", () => {
    expect(matchesWords("Plzeň", "plzen")).toBe(true);
    expect(matchesWords("Bernard Kvasnicové 11°", "KVASNICOVE")).toBe(true);
  });

  it("matches words in any order and position", () => {
    expect(matchesWords("Bernard Kvasnicové 11°", "bernard 11")).toBe(true);
    expect(matchesWords("Velkopopovický Kozel Černý", "kozel cerny")).toBe(
      true,
    );
    expect(matchesWords("Velkopopovický Kozel Černý", "cerny kozel")).toBe(
      true,
    );
  });

  it("needs every word", () => {
    expect(matchesWords("Bernard 12°", "bernard 11")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesWords("Plzeň", "   ")).toBe(true);
  });
});

const BEERS: ComboboxItem[] = [
  { value: "1", label: "Bernard 11°" },
  { value: "2", label: "Bernard 12°" },
  { value: "3", label: "Bernard Kvasnicové 11°" },
  { value: "4", label: "Plzeň (Plzeňský Prazdroj)" },
  { value: "5", label: "Velkopopovický Kozel Černý" },
];

const values = (items: unknown[]) =>
  (items as ComboboxItem[]).map((item) => item.value);

describe("wordFilter", () => {
  const run = (search: string, limit = Infinity) =>
    values(wordFilter({ options: BEERS, search, limit }));

  it("finds the beers the default Mantine filter missed", () => {
    expect(run("plzen")).toEqual(["4"]);
    expect(run("kvasnicove")).toEqual(["3"]);
    expect(run("bernard 11")).toEqual(["1", "3"]);
    expect(run("KOZEL cerny")).toEqual(["5"]);
  });

  it("respects the limit", () => {
    expect(run("bernard", 2)).toEqual(["1", "2"]);
  });

  it("filters inside groups and drops empty ones", () => {
    const result = wordFilter({
      options: [
        { group: "Bernard", items: BEERS.slice(0, 3) },
        { group: "Kozel", items: [BEERS[4]] },
      ],
      search: "kvasnicove",
      limit: Infinity,
    });
    expect(result).toEqual([{ group: "Bernard", items: [BEERS[2]] }]);
  });
});

describe("createWordFilter", () => {
  it("searches the extra text, not only the label", () => {
    const country: Record<string, string> = { "4": "Česká Republika" };
    const filter = createWordFilter(
      (item) => `${item.label} ${country[item.value] ?? ""}`,
    );
    expect(
      values(filter({ options: BEERS, search: "ceska", limit: Infinity })),
    ).toEqual(["4"]);
  });
});

describe("beerLabel", () => {
  it("leaves out a brand the name already contains", () => {
    expect(beerLabel("Gambrinus 10°", "Gambrinus")).toBe("Gambrinus 10°");
    expect(beerLabel("Velkopopovický Kozel 11°", "Kozel")).toBe(
      "Velkopopovický Kozel 11°",
    );
    expect(beerLabel("Budvar 33", "Budějovický Budvar")).toBe(
      "Budvar 33 (Budějovický Budvar)",
    );
  });

  it("adds the brand when the name doesn't mention it", () => {
    expect(beerLabel("Plzeň", "Plzeňský Prazdroj")).toBe(
      "Plzeň (Plzeňský Prazdroj)",
    );
    expect(beerLabel("Klasik", "Pivovar Nymburk")).toBe(
      "Klasik (Pivovar Nymburk)",
    );
  });

  it("handles a missing brand", () => {
    expect(beerLabel("Klasik", null)).toBe("Klasik");
  });
});
