import { describe, expect, it } from "vitest";
import { formatDate, pluralCaps } from "./format";

describe("formatDate", () => {
  it("formats an ISO date the Czech way", () => {
    expect(formatDate("2024-05-03")).toBe("3. 5. 2024");
    expect(formatDate("2023-12-31")).toBe("31. 12. 2023");
  });
});

describe("pluralCaps", () => {
  it("uses the singular for one", () => {
    expect(pluralCaps(1)).toBe("1 cap");
    expect(pluralCaps(0)).toBe("0 caps");
    expect(pluralCaps(103)).toBe("103 caps");
  });
});
