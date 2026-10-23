import { readdir, readFile, stat, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contentRepository } from "../src/content/index";
import { sourceModels } from "../src/content/internal/source-model-registry";
import { equipmentProductSchemaTypes, findSourceModelLeaks, hasInternalContentImport, publicObjectLeaks } from "../src/lib/catalog-safety";

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const textExtensions = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".html", ".rsc", ".txt", ".css", ".svg", ".xml", ".map", ".meta", ".body"]);
// Short suffixes are source designations in customer-facing text, but can be
// unrelated variable names in framework JavaScript. Scan them in public data,
// rendered markup and structured data without treating minified variables as copy.
const publicTextModels = sourceModels.map((model) => ({
  ...model,
  aliases: [...model.aliases, ...model.modelName.split("/").slice(1)],
}));

async function filesIn(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["cache", "node_modules", "internal"].includes(entry.name) || entry.isSymbolicLink()) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(target));
    else if (textExtensions.has(path.extname(entry.name))) files.push(target);
  }
  return files;
}

export async function checkPublicCatalogSource(): Promise<void> {
  const snapshot = await contentRepository.getSnapshot();
  if (Object.hasOwn(snapshot, "productFamilies")) throw new Error("Private source families must not be exposed by the public content repository");
  const objectLeaks = publicObjectLeaks(snapshot, publicTextModels);
  if (objectLeaks.length) throw new Error(`Private model names in public content: ${JSON.stringify(objectLeaks.slice(0, 8))}`);
  const files = (await Promise.all(["src/app", "src/components", "src/content", "src/lib", "public"].map((root) => filesIn(path.join(repository, root))))).flat();
  for (const file of files) {
    const text = await readFile(file, "utf8");
    if (file.includes(`${path.sep}src${path.sep}`) && hasInternalContentImport(text)) throw new Error(`Private content import in public runtime: ${path.relative(repository, file)}`);
    const leaks = findSourceModelLeaks(text, sourceModels);
    if (leaks.length) throw new Error(`Private model reference in ${path.relative(repository, file)}: ${JSON.stringify(leaks.slice(0, 5))}`);
  }
  console.info(`Public catalog source checked: ${snapshot.equipment.length} equipment intents, ${files.length} source/assets, no private model references`);
}

export async function checkPublicCatalogOutput(directory: string, writeReport = true): Promise<void> {
  const root = path.resolve(directory);
  if (!(await stat(root)).isDirectory()) throw new Error("Catalog output directory is missing");
  const files = await filesIn(root);
  if (!files.length) throw new Error("Catalog output contains no inspectable files");
  const violations: { file: string; term: string; line: number; context: string }[] = [];
  const schemaViolations: { file: string; types: string[] }[] = [];
  for (const file of files) {
    const relative = path.relative(root, file).replaceAll(path.sep, "/");
    for (const leak of findSourceModelLeaks(relative, sourceModels)) violations.push({ file: relative, ...leak });
    const content = await readFile(file, "utf8");
    for (const leak of findSourceModelLeaks(content, sourceModels)) violations.push({ file: relative, ...leak });
    if (path.extname(file) === ".html") {
      const markup = content.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
      for (const leak of findSourceModelLeaks(markup, publicTextModels)) violations.push({ file: relative, ...leak });
      for (const match of content.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
        for (const { leak } of publicObjectLeaks(JSON.parse(match[1]) as unknown, publicTextModels)) violations.push({ file: relative, ...leak });
      }
    }
    if (path.extname(file) === ".html" && /(?:^|\/)equipment(?:\/|\.html)/.test(relative)) {
      const types = equipmentProductSchemaTypes(content);
      if (types.length) schemaViolations.push({ file: relative, types });
    }
  }
  if (writeReport) {
    await mkdir(path.join(repository, ".local"), { recursive: true });
    const report = { output: path.relative(repository, root), scannedFiles: files.length, privateRecords: sourceModels.length, violations, schemaViolations };
    const reportName = root === path.join(repository, ".next") ? "catalog-server-output-audit.json" : root.endsWith("preview-build/.next") ? "catalog-preview-build-output-audit.json" : "catalog-static-output-audit.json";
    await writeFile(path.join(repository, ".local", reportName), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (violations.length) throw new Error(`Private model names in generated output: ${JSON.stringify(violations.slice(0, 8))}`);
  if (schemaViolations.length) throw new Error(`Equipment direction published as a model: ${JSON.stringify(schemaViolations)}`);
  console.info(`Catalog output checked: ${files.length} files in ${path.relative(repository, root)}, no private model names`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = process.argv.indexOf("--output");
  if (output >= 0) await checkPublicCatalogOutput(process.argv[output + 1] ?? path.join(repository, ".next"));
  else await checkPublicCatalogSource();
}
