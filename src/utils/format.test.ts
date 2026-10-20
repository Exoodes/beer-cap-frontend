import { afterAll, describe, expect, it } from "vitest";
import i18n from "../i18n";
import { formatDate, pluralCaps } from "./format";

describe("formatDate", () => {
  it("formats an ISO date the Czech way", () => {
    expect(formatDate("2024-05-03")).toBe("3. 5. 2024");
    expect(formatDate("2023-12-31")).toBe("31. 12. 2023");
  });
});

describe("pluralCaps", () => {
  afterAll(() => i18n.changeLanguage("en"));

  it("uses the singular for one", async () => {
    await i18n.changeLanguage("en");
    expect(pluralCaps(1)).toBe("1 cap");
    expect(pluralCaps(0)).toBe("0 caps");
    expect(pluralCaps(103)).toBe("103 caps");
  });

  it("uses all three Czech forms", async () => {
    await i18n.changeLanguage("cs");
    expect(pluralCaps(1)).toBe("1 víčko");
    expect(pluralCaps(3)).toBe("3 víčka");
    expect(pluralCaps(0)).toBe("0 víček");
    expect(pluralCaps(25)).toBe("25 víček");
  });
});
