import type { GasId } from "@/content";
import styles from "./gas-badge.module.css";

export type GasBadgeDefinition = {
  formula: string;
  name: string;
  accessibleLabel: string;
};

const DEFINITIONS: Record<GasId, GasBadgeDefinition> = {
  n2: { formula: "N₂", name: "Азот", accessibleLabel: "Азот — N₂" },
  he: { formula: "He", name: "Гелий", accessibleLabel: "Гелий — He" },
  h2: { formula: "H₂", name: "Водород", accessibleLabel: "Водород — H₂" },
  o2: { formula: "O₂", name: "Кислород", accessibleLabel: "Кислород — O₂" },
  co2: { formula: "CO₂", name: "Диоксид углерода", accessibleLabel: "Диоксид углерода — CO₂" },
  mixtures: { formula: "Газ / смесь", name: "Технологический газ или смесь", accessibleLabel: "Технологический газ или смесь" },
};

const CTA_LABELS: Record<GasId, string> = {
  n2: "азота",
  he: "гелия",
  h2: "водорода",
  o2: "кислорода",
  co2: "CO₂",
  mixtures: "газа или смеси",
};

export function gasBadgeDefinition(gas: GasId): GasBadgeDefinition {
  return DEFINITIONS[gas];
}

export function gasCtaLabel(gas: GasId): string {
  return CTA_LABELS[gas];
}

function MoleculeMark({ gas }: { gas: GasId }) {
  if (gas === "he") {
    return <svg className={styles.mark} viewBox="0 0 28 20" aria-hidden="true" focusable="false"><circle cx="14" cy="10" r="5.2" /></svg>;
  }
  if (gas === "co2") {
    return <svg className={styles.mark} viewBox="0 0 34 20" aria-hidden="true" focusable="false"><path d="M9 10h16" /><circle cx="7" cy="10" r="3.6" /><circle cx="17" cy="10" r="4.5" /><circle cx="27" cy="10" r="3.6" /></svg>;
  }
  if (gas === "mixtures") {
    return <svg className={styles.mark} viewBox="0 0 34 20" aria-hidden="true" focusable="false"><circle cx="8" cy="7" r="3.5" /><circle cx="18" cy="12" r="4.3" /><circle cx="27" cy="6" r="2.8" /></svg>;
  }
  return <svg className={styles.mark} viewBox="0 0 30 20" aria-hidden="true" focusable="false"><path d="M10 10h10" /><circle cx="8" cy="10" r="4" /><circle cx="22" cy="10" r="4" /></svg>;
}

export function GasBadge({ gas, className = "" }: { gas: GasId; className?: string }) {
  const definition = DEFINITIONS[gas];
  return <span className={`${styles.badge} ${className}`.trim()} data-gas-badge={gas} role="img" aria-label={definition.accessibleLabel}>
    <MoleculeMark gas={gas} />
    <span className={styles.formula} aria-hidden="true">{definition.formula}</span>
  </span>;
}
