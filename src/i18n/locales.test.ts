import { describe, expect, it } from "vitest";
import cs from "./cs.json";
import en from "./en.json";

type Tree = { [key: string]: string | Tree };

/** Every key path, with plural suffixes dropped: "common.caps". */
function keysOf(tree: Tree, prefix = ""): Set<string> {
  const keys = new Set<string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix + key.replace(/_(zero|one|two|few|many|other)$/, "");
    if (typeof value === "string") keys.add(path);
    else for (const inner of keysOf(value, `${path}.`)) keys.add(inner);
  }
  return keys;
}

describe("translations", () => {
  it("have the same keys in English and Czech", () => {
    expect([...keysOf(cs)].sort()).toEqual([...keysOf(en)].sort());
  });

  it("give Czech every plural form", () => {
    // Siblings of each "_other" key: 1 víčko, 2 víčka, 5 víček.
    const check = (tree: Tree) => {
      for (const [key, value] of Object.entries(tree)) {
        if (typeof value !== "string") check(value);
        else if (key.endsWith("_other")) {
          const base = key.slice(0, -"_other".length);
          for (const form of ["one", "few", "many"]) {
            expect(tree, `${base}_${form}`).toHaveProperty(`${base}_${form}`);
          }
        }
      }
    };
    check(cs);
  });
});
