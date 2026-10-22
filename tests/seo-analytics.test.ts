import { describe, expect, it } from "vitest";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import robots from "@/app/robots";
import { safeAnalyticsProps } from "@/lib/analytics";

describe("search and privacy contracts", () => {
  it("uses absolute canonical URLs without query parameters", () => {
    expect(pageMetadata("Азот", "Подбор", "/gases/nitrogen/").alternates?.canonical).toBe(absoluteUrl("/gases/nitrogen/"));
  });
  it("separates training policy and safely closes staging search", () => {
    expect(robots().rules).toEqual(expect.arrayContaining([
      expect.objectContaining({ userAgent: "*", disallow: "/" }),
      expect.objectContaining({ userAgent: expect.arrayContaining(["GPTBot"]), disallow: "/" }),
    ]));
  });
  it("never forwards contacts, free text or URL query to analytics", () => {
    expect(safeAnalyticsProps({ email: "person@example.test", phone: "+79990000000", message: "secret", gas: "n2", step: 2, path: "/rfq/?email=person@example.test", field: "test@example.test" })).toEqual({ gas: "n2", step: 2, path: "/rfq/" });
  });
});
