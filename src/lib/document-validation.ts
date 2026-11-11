import { z } from "zod";

export const DOCUMENT_CATEGORIES = [
  "Akademik",
  "Tugas Kuliah",
  "Magang",
  "Tugas Akhir",
  "Sertifikat",
  "Administrasi",
  "Lainnya",
] as const;

export const documentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul dokumen wajib diisi.")
    .max(150, "Judul maksimal 150 karakter."),

  category: z.enum(DOCUMENT_CATEGORIES),

  description: z
    .string()
    .trim()
    .max(5000, "Deskripsi maksimal 5.000 karakter.")
    .optional()
    .transform((value) => value || null),

  isCompleted: z.boolean(),
});

export function parseDocumentForm(formData: FormData) {
  return documentSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description") ?? "",
    isCompleted: formData.get("isCompleted") === "on",
  });
}
