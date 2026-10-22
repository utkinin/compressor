import { writeFile } from "node:fs/promises";
import { articles, cases, documents, equipment, gases, industries, solutions } from "../src/content/index";

const rows: string[][] = [["entity", "path", "intent", "gas_ids", "equipment_ids", "editorial_state"]];
for (const [group, entities] of Object.entries({ gases, solutions, equipment, industries, knowledge: articles, cases, documents })) {
  for (const entity of entities) {
    if ("access" in entity && entity.access === "internal") continue;
    rows.push([
      group,
      `/${group}/${entity.slug}/`,
      "intent" in entity ? entity.intent : entity.title,
      "gasIds" in entity ? entity.gasIds.join("|") : group === "gases" ? entity.id : "",
      "equipmentIds" in entity ? entity.equipmentIds.join("|") : group === "equipment" ? entity.id : "",
      entity.editorialState,
    ]);
  }
}
const csv = rows.map(row => row.map(value => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
await writeFile(new URL("../docs/SEMANTIC_MATRIX.csv", import.meta.url), `${csv}\n`);
console.info(`Exported ${rows.length - 1} finite content routes.`);
