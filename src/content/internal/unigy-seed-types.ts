/** Original scaffold contract. Kept internal to preserve the supplied raw seed without normalizing its values. */
export type VerificationStatus = "verified" | "draft" | "needs-review";

export type ProductFamily = {
  slug: string;
  name: string;
  category: "oil-free-reciprocating" | "booster" | "system";
  short: string;
  gases: string[];
  inletPressureMpaMax?: number;
  dischargePressureMpaMax?: number;
  flowNm3hMin?: number;
  flowNm3hMax?: number;
  motorKwMin?: number;
  motorKwMax?: number;
  tightnessMbarLs?: number;
  cooling: string[];
  transmission?: string;
  verificationStatus: VerificationStatus;
  sourceNote: string;
};
