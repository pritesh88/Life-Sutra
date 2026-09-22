import { z } from "zod";

// Path separators and control characters never belong in a stored filename.
const fileName = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine(
    (value) => !/[\\/]/.test(value) && ![...value].some((char) => char.charCodeAt(0) < 32),
    "Invalid file name.",
  );

export const createArticleSchema = z.object({
  title: z.string().trim().min(5, "Enter a title.").max(300),
  abstract: z.string().trim().min(50, "The abstract must be at least 50 characters.").max(5000),
  manuscriptFileName: fileName.optional(),
});

export const updateArticleSchema = z
  .object({
    title: z.string().trim().min(5).max(300).optional(),
    abstract: z.string().trim().min(50).max(5000).optional(),
    manuscriptFileName: fileName.nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "Nothing to update.");

export const assignReviewerSchema = z.object({ reviewerId: z.string().min(1).max(64) });

export const decisionSchema = z.object({
  decision: z.enum(["ACCEPTED", "REJECTED", "REVISION_REQUESTED"]),
  note: z.string().trim().min(1, "A decision note is required.").max(5000),
});

export const submitReviewSchema = z.object({
  recommendation: z.enum(["ACCEPT", "MINOR_REVISION", "MAJOR_REVISION", "REJECT"]),
  commentsToAuthor: z.string().trim().min(20, "Provide substantive comments.").max(20000),
  commentsToEditor: z.string().trim().max(20000).optional(),
});
