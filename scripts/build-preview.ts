import { constants } from "node:fs";
import { access, cp, lstat, mkdir, open, readFile, readdir, realpath, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { validateBasePath } from "../src/lib/preview";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localRoot = path.join(repositoryRoot, ".local");
const buildRoot = path.join(localRoot, "preview-build");
const exportRoot = path.join(localRoot, "github-pages");
const ownershipMarker = ".lanfor-preview-owned";
const markerText = "Lanfor isolated static preview build v1\n";

async function acquireBuildLock(): Promise<() => Promise<void>> {
  const lockPath = path.join(localRoot, "preview-build.lock");
  const contents = `${process.pid}\n${Date.now()}\n`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const handle = await open(lockPath, "wx", 0o600);
      try { await handle.writeFile(contents); } finally { await handle.close(); }
      return async () => {
        if (await exists(lockPath) && await readFile(lockPath, "utf8") === contents) await rm(lockPath);
      };
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") throw error;
      const previous = await readFile(lockPath, "utf8");
      const pid = Number(previous.split("\n")[0]);
      if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error("Preview build lock is not recognised; preserving it for inspection");
      try {
        process.kill(pid, 0);
        throw new Error("Another preview build is running; wait for it to finish before retrying");
      } catch (probe) {
        if (!(probe instanceof Error) || !("code" in probe) || probe.code !== "ESRCH") throw probe;
      }
      if (await readFile(lockPath, "utf8") === previous) await rm(lockPath);
    }
  }
  throw new Error("Could not acquire the preview build lock");
}

async function exists(target: string): Promise<boolean> {
  try { await access(target, constants.F_OK); return true; } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
}

async function prepareOwnedDirectory(target: string) {
  if (path.dirname(target) !== localRoot) throw new Error("Preview output must stay directly inside .local");
  if (await exists(target)) {
    if ((await lstat(target)).isSymbolicLink()) throw new Error("Refusing to replace a symlink at the preview output");
    if (!await exists(path.join(target, ownershipMarker)) || await readFile(path.join(target, ownershipMarker), "utf8") !== markerText) {
      throw new Error(`Refusing to remove an unowned directory: ${path.basename(target)}`);
    }
    await rm(target, { recursive: true });
  }
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, ownershipMarker), markerText, { mode: 0o600 });
}

async function runNextBuild(environment: NodeJS.ProcessEnv) {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(repositoryRoot, "node_modules", "next", "dist", "bin", "next"), "build", "--webpack"], { cwd: buildRoot, env: environment, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => code === 0 ? resolve() : reject(new Error(`Static build failed (${signal || code})`)));
  });
}

async function walkFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error("Static preview cannot contain symlinked assets");
    if (entry.isDirectory()) files.push(...await walkFiles(target));
    else files.push(target);
  }
  return files;
}

function buildEnvironment(basePath: string, origin: string): NodeJS.ProcessEnv {
  // Never inherit CRM credentials, public analytics IDs or contact configuration.
  const environment: NodeJS.ProcessEnv = { NODE_ENV: "production" };
  for (const name of ["PATH", "HOME", "TMPDIR", "TEMP", "TMP", "SYSTEMROOT", "COMSPEC", "SHELL", "USER", "LOGNAME", "CI", "TERM", "LANG", "LC_ALL", "TZ", "NODE_OPTIONS"]) {
    if (process.env[name]) environment[name] = process.env[name];
  }
  return {
    ...environment,
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    LANFOR_STATIC_PREVIEW: "true",
    NEXT_PUBLIC_STATIC_PREVIEW: "true",
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: origin,
    SITE_URL: origin,
    SEO_INDEXABLE: "false",
    RFQ_STAGING_MODE: "true",
    RFQ_ENABLED: "false",
    RFQ_LEGAL_APPROVED: "false",
    NEXT_PUBLIC_GA4_ID: "",
    NEXT_PUBLIC_YANDEX_METRIKA_ID: "",
  };
}

async function buildPreview() {
  const repository = process.env.GITHUB_REPOSITORY || "utkinin/compressor";
  if (!/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error("Invalid GITHUB_REPOSITORY");
  const [owner, name] = repository.split("/");
  const basePath = validateBasePath(process.env.PREVIEW_BASE_PATH ?? (name.toLowerCase() === `${owner.toLowerCase()}.github.io` ? "" : `/${name}`));
  const origin = new URL(process.env.PREVIEW_SITE_ORIGIN || `https://${owner}.github.io`);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) throw new Error("PREVIEW_SITE_ORIGIN must be an HTTPS origin without a path or credentials");

  await mkdir(localRoot, { recursive: true });
  if ((await lstat(localRoot)).isSymbolicLink() || await realpath(localRoot) !== localRoot) throw new Error(".local must be a real directory inside the checkout");
  const releaseLock = await acquireBuildLock();
  try {
  await prepareOwnedDirectory(buildRoot);
  await access(path.join(repositoryRoot, "node_modules", "next", "dist", "bin", "next"), constants.R_OK);

  // An allowlist copies both tracked and newly created source while excluding all
  // credentials, environment files, Git metadata, caches, tests and runtime data.
  const sources = ["src", "public", "next.config.ts", "tsconfig.json", "next-env.d.ts", "package.json", "package-lock.json"];
  for (const source of sources) {
    await cp(path.join(repositoryRoot, source), path.join(buildRoot, source), {
      recursive: true,
      filter: async (candidate) => {
        const name = path.basename(candidate);
        if (name.startsWith(".env") || [".git", ".local", "node_modules", ".next", ".npmrc", ".netrc"].includes(name)) return false;
        if ((await lstat(candidate)).isSymbolicLink()) throw new Error("Refusing a symlink in preview source");
        return true;
      },
    });
  }
  await symlink(path.join(repositoryRoot, "node_modules"), path.join(buildRoot, "node_modules"), "dir");
  await rm(path.join(buildRoot, "src", "app", "api"), { recursive: true, force: true });

  await writeFile(path.join(buildRoot, "src", "app", "rfq", "page.tsx"), `import { RfqPreview } from "@/components/rfq-preview";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Демонстрация инженерного RFQ", "Интерфейс квалифицированного запроса: демонстрация без отправки и хранения данных.", "/rfq/");
export default function PreviewRfqPage() { return <RfqPreview />; }
`);
  const contactPath = path.join(buildRoot, "src", "app", "contacts", "page.tsx");
  const contacts = await readFile(contactPath, "utf8");
  if (!contacts.includes('export const dynamic = "force-dynamic";')) throw new Error("Contacts preview transform needs review after a source change");
  await writeFile(contactPath, contacts.replace('export const dynamic = "force-dynamic";', ""));

  await writeFile(path.join(buildRoot, "src", "app", "legal", "page.tsx"), `import { PreviewLegalHub } from "@/components/preview-legal-page";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Условия демонстрации", "Статическая демонстрация сайта без передачи RFQ и сбора контактов.", "/legal/");
export default function PreviewLegalIndex() { return <PreviewLegalHub />; }
`);

  await writeFile(path.join(buildRoot, "src", "app", "legal", "[slug]", "page.tsx"), `import { notFound } from "next/navigation";
import { PreviewLegalPage, previewLegalTitles } from "@/components/preview-legal-page";
import { pageMetadata } from "@/lib/seo";
export function generateStaticParams() { return Object.keys(previewLegalTitles).map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; return pageMetadata(previewLegalTitles[slug] || "Правовая информация", "Условия браузерной демонстрации без передачи RFQ.", "/legal/" + slug + "/"); }
export default async function PreviewLegalRoute({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; if (!previewLegalTitles[slug]) notFound(); return <PreviewLegalPage slug={slug} />; }
`);

  for (const metadataRoute of ["robots.ts", "sitemap.ts"]) {
    const file = path.join(buildRoot, "src", "app", metadataRoute);
    const source = await readFile(file, "utf8");
    if (/export\s+const\s+dynamic\s*=/.test(source)) throw new Error(`Metadata preview transform needs review: ${metadataRoute}`);
    await writeFile(file, `${source}\nexport const dynamic = "force-static";\n`);
  }

  for (const file of await walkFiles(path.join(buildRoot, "src", "app"))) {
    if (/\.[tj]sx?$/.test(file) && /export\s+const\s+dynamic\s*=\s*["']force-dynamic["']/.test(await readFile(file, "utf8"))) throw new Error(`Unsupported dynamic route in static preview: ${path.relative(buildRoot, file)}`);
  }
  console.log(`Building browser-only preview for ${origin.origin}${basePath}/`);
  await runNextBuild(buildEnvironment(basePath, origin.origin));

  const output = path.join(buildRoot, "out");
  const home = await readFile(path.join(output, "index.html"), "utf8");
  if (!home.includes(`${basePath}/_next/`) || !home.includes('content="noindex, nofollow"')) throw new Error("Preview asset prefix or noindex guard is missing");
  for (const route of ["rfq", "solutions", "gases", "equipment", "contacts", "legal/privacy", "legal/consent", "legal/cookies"]) await access(path.join(output, route, "index.html"), constants.R_OK);
  await access(path.join(output, "404.html"), constants.R_OK);
  if (await exists(path.join(output, "api"))) throw new Error("Static preview unexpectedly contains API routes");
  await prepareOwnedDirectory(exportRoot);
  await cp(output, exportRoot, { recursive: true });
  await writeFile(path.join(exportRoot, ".nojekyll"), "");
  console.log(`Static preview ready: ${path.relative(repositoryRoot, exportRoot)} (no API, CRM, analytics or environment files)`);
  } finally {
    await releaseLock();
  }
}

buildPreview().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Static preview build failed");
  process.exitCode = 1;
});
