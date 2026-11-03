import { z } from "zod";

function isValidDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Judul tugas wajib diisi.").max(150),

  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((value) => value || null),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),

  dueDate: z
    .string()
    .optional()
    .transform((value) => value || null)
    .refine(
      (value) => value === null || isValidDateOnly(value),
      "Format deadline tidak valid.",
    ),
});

export function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "TODO",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate") || undefined,
  });
}
