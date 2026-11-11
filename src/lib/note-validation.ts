import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().trim().min(1, "Judul catatan wajib diisi.").max(150),

  content: z
    .string()
    .trim()
    .max(10000, "Isi catatan maksimal 10.000 karakter.")
    .optional()
    .transform((value) => value ?? ""),

  isPinned: z.boolean(),
});

export function parseNoteForm(formData: FormData) {
  return noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") ?? "",
    isPinned: formData.get("isPinned") === "on",
  });
}
