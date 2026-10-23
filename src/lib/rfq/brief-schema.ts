import { z } from "zod";
import { rfqSchema } from "./schema";
import { ATTACHMENT_MAX_FILES } from "./attachment-policy";

/** The server replaces attachmentCount with the number of validated multipart files. */
export const briefRfqSchema = z.object({
  intake: z.literal("brief"),
  description: z.string().trim().max(12000, "Сократите описание до 12 000 символов").default(""),
  model: z.string().trim().max(300).optional(),
  gas: z.enum(["n2", "he", "h2", "o2", "co2", "mixtures"]).optional(),
  attachmentCount: z.number().int().min(0).max(ATTACHMENT_MAX_FILES).default(0),
  project: rfqSchema.shape.project,
  contact: rfqSchema.shape.contact,
  consent: rfqSchema.shape.consent,
  attribution: rfqSchema.shape.attribution,
  honeypot: rfqSchema.shape.honeypot,
  requestContext: rfqSchema.shape.requestContext,
}).strict().superRefine((value, context) => {
  if (value.description.length < 10 && (value.model?.length ?? 0) < 2 && value.attachmentCount === 0) {
    context.addIssue({ code: "custom", path: ["description"], message: "Опишите задачу, укажите модель оборудования или приложите файл" });
  }
});

export type BriefRfqInput = z.infer<typeof briefRfqSchema>;
export const rfqSubmissionSchema = z.union([rfqSchema, briefRfqSchema]);
export type RfqSubmission = z.infer<typeof rfqSubmissionSchema>;
