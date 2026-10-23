import { createHash } from "node:crypto";
import path from "node:path";
import { ATTACHMENT_MAX_BYTES, ATTACHMENT_MAX_FILES, ATTACHMENT_MAX_TOTAL_BYTES, ATTACHMENT_MEDIA_TYPES } from "./attachment-policy";

/** Private transport/storage data. Never returned by the public RFQ API. */
export interface RfqAttachment {
  name: string;
  mediaType: (typeof ATTACHMENT_MEDIA_TYPES)[keyof typeof ATTACHMENT_MEDIA_TYPES];
  size: number;
  sha256: string;
  contentBase64: string;
}

export class AttachmentError extends Error {
  constructor(public readonly status: 413 | 415 | 422, message: string) { super(message); }
}

function safeName(name: string): string {
  const base = name.replaceAll("\\", "/").split("/").at(-1) ?? "file";
  return base.normalize("NFKC").replace(/[^\p{L}\p{N} ._-]/gu, "_").replace(/^\.+/, "").slice(-120) || "file";
}

function validateContent(extension: string, bytes: Uint8Array): void {
  const data = Buffer.from(bytes);
  if (extension === "pdf") {
    const ascii = data.toString("latin1");
    if (!/^%PDF-(?:1\.[0-7]|2\.0)/.test(ascii) || !/%%EOF\s*$/.test(ascii.slice(-1024))
      || /\/(?:JavaScript|JS|OpenAction|AA|Launch|EmbeddedFile|RichMedia|SubmitForm|XFA)\b/.test(ascii)) {
      throw new AttachmentError(415, "PDF не прошёл проверку формата или содержит активное содержимое");
    }
    return;
  }
  if (extension === "png") {
    if (!data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      || !data.subarray(-12).equals(Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]))) {
      throw new AttachmentError(415, "PNG не прошёл проверку формата");
    }
    return;
  }
  if (extension === "jpg" || extension === "jpeg") {
    if (data[0] !== 0xff || data[1] !== 0xd8 || data[2] !== 0xff || data.at(-2) !== 0xff || data.at(-1) !== 0xd9) {
      throw new AttachmentError(415, "JPEG не прошёл проверку формата");
    }
    return;
  }
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); } catch { throw new AttachmentError(415, "Текстовый файл должен быть в UTF-8"); }
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text) || /<(?:!doctype|html|svg|script|iframe|object|embed)\b/i.test(text)) {
    throw new AttachmentError(415, "Разрешён только обычный текст без активной разметки");
  }
}

/** Bounded files remain untrusted documents; this is not a malware-scanning claim. */
export async function validateAttachments(files: readonly File[]): Promise<RfqAttachment[]> {
  if (files.length > ATTACHMENT_MAX_FILES) throw new AttachmentError(413, "Можно приложить не более трёх файлов");
  if (files.reduce((size, file) => size + file.size, 0) > ATTACHMENT_MAX_TOTAL_BYTES) throw new AttachmentError(413, "Общий размер файлов превышает 10 МБ");
  const attachments: RfqAttachment[] = [];
  for (const file of files) {
    if (file.size === 0) throw new AttachmentError(422, "Пустые файлы не принимаются");
    if (file.size > ATTACHMENT_MAX_BYTES) throw new AttachmentError(413, "Размер одного файла превышает 5 МБ");
    const extension = path.extname(file.name).slice(1).toLowerCase();
    if (!Object.hasOwn(ATTACHMENT_MEDIA_TYPES, extension)) throw new AttachmentError(415, "Разрешены только PDF, JPEG, PNG и TXT");
    const mediaType = ATTACHMENT_MEDIA_TYPES[extension as keyof typeof ATTACHMENT_MEDIA_TYPES];
    if (file.type && file.type.toLowerCase() !== mediaType) throw new AttachmentError(415, "Тип файла не соответствует расширению");
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.byteLength !== file.size) throw new AttachmentError(422, "Не удалось прочитать файл полностью");
    validateContent(extension, bytes);
    attachments.push({ name: safeName(file.name), mediaType, size: bytes.byteLength, sha256: createHash("sha256").update(bytes).digest("hex"), contentBase64: Buffer.from(bytes).toString("base64") });
  }
  return attachments;
}
