/** Public static preview is intentionally separate from the server-backed RFQ. */
export const isStaticPreview = process.env.LANFOR_STATIC_PREVIEW === "true";

export function validateBasePath(value: string): string {
  if (value !== "" && !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+$/.test(value)) {
    throw new Error("Preview base path must be empty or a path such as /compressor, without a trailing slash");
  }
  return value;
}

export const previewBasePath = validateBasePath(process.env.NEXT_PUBLIC_BASE_PATH || "");

/** Use for public files and native anchors. Next Link applies basePath itself. */
export function withBasePath(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//") || !previewBasePath) return path;
  if (path === previewBasePath || path.startsWith(`${previewBasePath}/`)) return path;
  return `${previewBasePath}${path}`;
}
