"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const taskSchema = z.object({
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
    .transform((value) => value || null),
});

async function requireUser(): Promise<{ id: string }> {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) {
    redirect("/login");
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || userId.length === 0) {
    redirect("/login");
  }

  return { id: userId };
}

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "TODO",
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate") || undefined,
  });
}

export async function createTask(formData: FormData) {
  const user = await requireUser();
  const result = parseTaskForm(formData);

  if (!result.success) {
    throw new Error("Data tugas tidak valid. Periksa kembali isianmu.");
  }

  const dueDate = result.data.dueDate
    ? new Date(`${result.data.dueDate}T00:00:00.000Z`)
    : null;

  if (dueDate && Number.isNaN(dueDate.getTime())) {
    throw new Error("Format deadline tidak valid.");
  }

  await prisma.task.create({
    data: {
      ...result.data,
      dueDate,
      completedAt: result.data.status === "DONE" ? new Date() : null,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/tasks");
}

export async function updateTask(id: string, formData: FormData) {
  const user = await requireUser();
  const result = parseTaskForm(formData);

  if (!result.success) {
    throw new Error("Data tugas tidak valid. Periksa kembali isianmu.");
  }

  const dueDate = result.data.dueDate
    ? new Date(`${result.data.dueDate}T00:00:00.000Z`)
    : null;

  if (dueDate && Number.isNaN(dueDate.getTime())) {
    throw new Error("Format deadline tidak valid.");
  }

  const existingTask = await prisma.task.findFirst({
    where: { id, userId: user.id },
    select: { id: true, status: true, completedAt: true },
  });

  if (!existingTask) {
    throw new Error("Tugas tidak ditemukan.");
  }

  await prisma.task.update({
    where: { id: existingTask.id },
    data: {
      ...result.data,
      dueDate,
      completedAt:
        result.data.status === "DONE"
          ? existingTask.status === "DONE"
            ? existingTask.completedAt ?? new Date()
            : new Date()
          : null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/tasks");
}

export async function deleteTask(id: string) {
  const user = await requireUser();

  await prisma.task.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
}
