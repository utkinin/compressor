import { describe, expect, it } from "vitest";
import { solutions } from "../src/content/solutions";

const pet = solutions.find((item) => item.id === "pet-high-pressure-air");
const refrigerant = solutions.find((item) => item.id === "refrigerant-transfer-compression");

describe("Issue 14 PET and refrigerant directions", () => {
  it("publishes both historical Lanfor directions as solution intents", () => {
    expect(pet?.slug).toBe("oil-free-high-pressure-air-for-pet");
    expect(refrigerant?.slug).toBe("refrigerant-transfer-compression");
  });

  it("does not copy old public product codes or numeric envelopes into the new solution records", () => {
    const text = JSON.stringify([pet, refrigerant]);
    expect(text).not.toMatch(/PET-C|RF-C|С-0000074|С-0000030/);
    expect(text).not.toMatch(/25.?40|8.?30|2.?90/);
  });

  it("keeps the refrigerant direction free of an unverified Oil-Free product claim", () => {
    const text = JSON.stringify(refrigerant).toLowerCase();
    expect(text).not.toContain("безмаслян");
    expect(text).not.toContain("oil-free");
  });
});
