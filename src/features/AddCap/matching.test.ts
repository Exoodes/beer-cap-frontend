import { describe, expect, it } from "vitest";
import type { BeerCap } from "../../types";
import {
  type BeerLike,
  findSimilarBeers,
  groupCapsByBeer,
  guessBrandId,
  guessCountryId,
  nameKey,
} from "./matching";

const CZ = { id: 1, name: "Česká Republika" };
const SE = { id: 2, name: "Švédsko" };

const BRANDS = [
  { id: 10, name: "Gambrinus" },
  { id: 11, name: "Kozel" },
  { id: 12, name: "Budějovický Budvar" },
  { id: 13, name: "Plzeňský Prazdroj" },
  { id: 14, name: "IKEA (Krönleins Bryggeri)" },
];

const beer = (
  id: number,
  name: string,
  brandId: number,
  country: BeerLike["country"] = CZ,
): BeerLike => ({
  id,
  name,
  beer_brand: BRANDS.find((b) => b.id === brandId),
  country,
});

const BEERS = [
  beer(1, "Gambrinus 10°", 10),
  beer(2, "Gambrinus 12°", 10),
  beer(3, "Gambrinus Dry", 10),
  beer(4, "Velkopopovický Kozel Černý", 11),
  beer(5, "Budvar 33", 12),
  beer(6, "Budvar - Tmavý ležák", 12),
  beer(7, "Plzeň", 13),
  beer(8, "Öl ljus lager - IKEA pivo", 14, SE),
];

const names = (beers: BeerLike[]) => beers.map((b) => b.name);

describe("nameKey", () => {
  it("drops accents, case and punctuation", () => {
    expect(nameKey("Gambrinus 10° Originál")).toBe("gambrinus 10 original");
    expect(nameKey("  Budvar - Tmavý   ležák ")).toBe("budvar tmavy lezak");
  });
});

describe("findSimilarBeers", () => {
  it("finds the same name typed differently", () => {
    expect(names(findSimilarBeers("gambrinus dry", BEERS))).toEqual([
      "Gambrinus Dry",
    ]);
    expect(names(findSimilarBeers("Kozel cerny", BEERS))).toEqual([
      "Velkopopovický Kozel Černý",
    ]);
  });

  it("finds small typos", () => {
    expect(names(findSimilarBeers("Gambrinus Dryy", BEERS))).toEqual([
      "Gambrinus Dry",
    ]);
    expect(names(findSimilarBeers("Plzen", BEERS))).toEqual(["Plzeň"]);
  });

  it("treats different numbers as different beers", () => {
    expect(names(findSimilarBeers("Gambrinus 11°", BEERS))).toEqual([]);
    expect(names(findSimilarBeers("Gambrinus 10°", BEERS))).toEqual([
      "Gambrinus 10°",
    ]);
  });

  it("lists names that contain each other", () => {
    expect(names(findSimilarBeers("Budvar", BEERS))).toEqual([
      "Budvar 33",
      "Budvar - Tmavý ležák",
    ]);
  });

  it("ignores unrelated and too-short names", () => {
    expect(findSimilarBeers("Svijanský Máz", BEERS)).toEqual([]);
    expect(findSimilarBeers("Pl", BEERS)).toEqual([]);
    expect(findSimilarBeers("  ", BEERS)).toEqual([]);
  });
});

describe("guessBrandId", () => {
  it("uses a brand named in the beer name", () => {
    expect(guessBrandId("Gambrinus Nealko", BRANDS, BEERS)).toBe(10);
    expect(guessBrandId("Velkopopovický Kozel Nealko", BRANDS, BEERS)).toBe(11);
  });

  it("prefers the longest brand name", () => {
    const brands = [...BRANDS, { id: 15, name: "Kozel Premium" }];
    expect(guessBrandId("Kozel Premium Lager", brands, BEERS)).toBe(15);
  });

  it("falls back to beers that start with the same word", () => {
    expect(guessBrandId("Budvar Nealko", BRANDS, BEERS)).toBe(12);
  });

  it("returns null when nothing fits", () => {
    expect(guessBrandId("Svijanský Máz", BRANDS, BEERS)).toBeNull();
    expect(guessBrandId("", BRANDS, BEERS)).toBeNull();
  });
});

describe("guessCountryId", () => {
  it("takes the country most of the brand's beers come from", () => {
    expect(guessCountryId(14, BEERS)).toBe(2);
    expect(guessCountryId(10, BEERS)).toBe(1);
  });

  it("returns null for a brand without beers", () => {
    expect(guessCountryId(99, BEERS)).toBeNull();
  });
});

describe("groupCapsByBeer", () => {
  const cap = (id: number, beerId: number) =>
    ({ id, beer: { id: beerId } }) as BeerCap;

  it("groups caps by beer, newest first", () => {
    const groups = groupCapsByBeer([cap(1, 7), cap(5, 7), cap(3, 8)]);
    expect(groups.get(7)?.map((c) => c.id)).toEqual([5, 1]);
    expect(groups.get(8)?.map((c) => c.id)).toEqual([3]);
    expect(groups.get(9)).toBeUndefined();
  });
});
