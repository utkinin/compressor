import type { Entity, GasId } from "./types";

export type NewsEventType = "equipment" | "delivery" | "project" | "testing" | "certificate" | "exhibition" | "product-update" | "new-direction" | "company-event";

export type NewsVerification = { status: "pending" } | {
  status: "confirmed";
  approvedBy: string;
  source: { title: string; url: string; locator: string };
};

/** A real Lanfor event; external technical reporting belongs in article research. */
export interface News extends Entity {
  kind: "lanfor-event";
  organization: "Lanfor Gas Systems";
  eventType: NewsEventType;
  eventDate: string;
  published: string;
  updated: string;
  verification: NewsVerification;
  sections: { title: string; paragraphs: string[] }[];
  gasIds: GasId[];
  equipmentIds: string[];
  solutionIds: string[];
}
