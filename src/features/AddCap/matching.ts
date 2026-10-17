// Helpers that answer "do I already have this?" while adding a cap: grouping
// the collection by beer, spotting near-duplicate beer names, and guessing
// the brand and country of a new beer from the ones already collected.
import type { BeerCap } from "../../types";
import { normalize } from "../../utils/search";

interface Named {
  id: number;
  name: string;
}

export interface BeerLike extends Named {
  beer_brand?: Named | null;
  country?: Named | null;
}

/** The collection's caps per beer id, newest first. */
export function groupCapsByBeer(caps: BeerCap[]): Map<number, BeerCap[]> {
  const groups = new Map<number, BeerCap[]>();
  for (const cap of [...caps].sort((a, b) => b.id - a.id)) {
    const group = groups.get(cap.beer.id);
    if (group) group.push(cap);
    else groups.set(cap.beer.id, [cap]);
  }
  return groups;
}

/** "Gambrinus 10° Originál" -> "gambrinus 10 original". */
export function nameKey(name: string): string {
  return normalize(name)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

const numbersOf = (key: string) => key.match(/\d+/g)?.join(" ") ?? "";

/**
 * How close an existing name is to a new one, or null if not similar.
 * Names whose numbers differ ("10°" vs "12°") are different beers.
 */
function similarity(existing: string, typed: string): number | null {
  if (existing === typed) return 0;
  const [a, b] = [numbersOf(existing), numbersOf(typed)];
  if (a && b && a !== b) return null;
  const shorter = Math.min(existing.length, typed.length);
  if (shorter >= 4 && (existing.includes(typed) || typed.includes(existing))) {
    return 1;
  }
  const distance = levenshtein(existing, typed);
  if (Math.max(existing.length, typed.length) >= 5 && distance <= 2) {
    return 1 + distance;
  }
  return null;
}

/** Existing beers whose name looks like the typed one, closest first. */
export function findSimilarBeers<T extends BeerLike>(
  name: string,
  beers: T[],
  limit = 3,
): T[] {
  const typed = nameKey(name);
  if (!typed) return [];
  return beers
    .map((beer) => ({ beer, score: similarity(nameKey(beer.name), typed) }))
    .filter(
      (match): match is { beer: T; score: number } => match.score !== null,
    )
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((match) => match.beer);
}

function mostCommon(ids: number[]): number | null {
  const counts = new Map<number, number>();
  let best: number | null = null;
  for (const id of ids) {
    const count = (counts.get(id) ?? 0) + 1;
    counts.set(id, count);
    if (best === null || count > (counts.get(best) ?? 0)) best = id;
  }
  return best;
}

/**
 * The brand a new beer probably belongs to: a brand named in the beer's
 * name ("Gambrinus Nealko" -> Gambrinus), else the brand of beers starting
 * with the same word ("Budvar Nealko" -> Budějovický Budvar).
 */
export function guessBrandId(
  beerName: string,
  brands: Named[],
  beers: BeerLike[],
): number | null {
  const key = ` ${nameKey(beerName)} `;
  const named = brands
    .map((brand) => ({ id: brand.id, key: nameKey(brand.name) }))
    .filter((brand) => brand.key && key.includes(` ${brand.key} `))
    .sort((a, b) => b.key.length - a.key.length);
  if (named.length) return named[0].id;

  const firstWord = key.trim().split(" ")[0];
  if (firstWord.length < 3) return null;
  return mostCommon(
    beers
      .filter((beer) => nameKey(beer.name).split(" ")[0] === firstWord)
      .flatMap((beer) => (beer.beer_brand ? [beer.beer_brand.id] : [])),
  );
}

/** The country most of the brand's beers come from. */
export function guessCountryId(
  brandId: number,
  beers: BeerLike[],
): number | null {
  return mostCommon(
    beers
      .filter((beer) => beer.beer_brand?.id === brandId)
      .flatMap((beer) => (beer.country ? [beer.country.id] : [])),
  );
}
