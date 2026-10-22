import http from "node:http";
import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import path from "node:path";

const root = await realpath(path.resolve(".local/github-pages"));
const mount = "/compressor";
const port = Number(process.env.PREVIEW_PORT || "3100");
if (!Number.isSafeInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid preview port");
const mime = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".ico": "image/x-icon" };

async function serve(request, response) {
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (!["GET", "HEAD"].includes(request.method || "")) {
    response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return;
  }
  const [rawPath, query = ""] = (request.url || "/").split("?", 2);
  let pathname;
  try { pathname = decodeURIComponent(rawPath); } catch { response.writeHead(400); response.end(); return; }
  if (pathname.includes("\0") || pathname.includes("\\") || pathname.split("/").includes("..")) { response.writeHead(400); response.end(); return; }
  if (pathname !== mount && !pathname.startsWith(`${mount}/`)) { response.writeHead(404); response.end(); return; }
  let target = path.resolve(root, `.${pathname.slice(mount.length) || "/"}`);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end(); return; }
  try {
    let information = await stat(target);
    if (information.isDirectory()) {
      if (!pathname.endsWith("/")) { response.writeHead(301, { Location: `${pathname}/${query ? `?${query}` : ""}` }); response.end(); return; }
      target = path.join(target, "index.html"); information = await stat(target);
    }
    if (!information.isFile()) throw new Error("Not a file");
    const actual = await realpath(target);
    if (!actual.startsWith(`${root}${path.sep}`)) { response.writeHead(403); response.end(); return; }
    response.writeHead(200, { "Content-Type": mime[path.extname(actual)] || "application/octet-stream", "Content-Length": information.size });
    if (request.method === "HEAD") response.end();
    else createReadStream(actual).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (request.method === "HEAD") response.end();
    else createReadStream(path.join(root, "404.html")).pipe(response);
  }
}

const server = http.createServer((request, response) => {
  void serve(request, response).catch(() => { if (!response.headersSent) response.writeHead(500); response.end(); });
});
server.listen(port, "127.0.0.1", () => console.log(`Static preview acceptance server ready on port ${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(() => process.exit(0)));
