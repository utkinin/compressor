/** Shared limits only. Content validation and private persistence run on the server. */
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_MAX_TOTAL_BYTES = 10 * 1024 * 1024;
export const ATTACHMENT_MAX_FILES = 3;
export const ATTACHMENT_ACCEPT = ".pdf,.jpg,.jpeg,.png,.txt";
export const ATTACHMENT_MEDIA_TYPES = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  txt: "text/plain",
} as const;
