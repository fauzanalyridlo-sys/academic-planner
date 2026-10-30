"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const milestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Judul milestone wajib diisi.")
    .max(150),
  description: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((value) => value || null),
  status: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "BLOCKED",
  ]),
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

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  return { id: userId };
}

function parseMilestoneForm(formData: FormData) {
  return milestoneSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    status: formData.get("status") || "NOT_STARTED",
    dueDate: formData.get("dueDate") || undefined,
  });
}

function parseDueDate(value: string | null): Date | null {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Format tanggal tidak valid.");
  }

  return date;
}

function refreshMilestonePages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ta-progress");
}

export async function createMilestone(formData: FormData) {
  const user = await requireUser();
  const result = parseMilestoneForm(formData);

  if (!result.success) {
    throw new Error("Data milestone tidak valid.");
  }

  const lastMilestone = await prisma.tAMilestone.findFirst({
    where: { userId: user.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.tAMilestone.create({
    data: {
      ...result.data,
      dueDate: parseDueDate(result.data.dueDate),
      userId: user.id,
      sortOrder: (lastMilestone?.sortOrder ?? -1) + 1,
    },
  });

  refreshMilestonePages();
  redirect("/dashboard/ta-progress");
}

export async function updateMilestone(
  id: string,
  formData: FormData,
) {
  const user = await requireUser();
  const result = parseMilestoneForm(formData);

  if (!result.success) {
    throw new Error("Data milestone tidak valid.");
  }

  const existing = await prisma.tAMilestone.findFirst({
    where: {
      id,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("Milestone tidak ditemukan.");
  }

  await prisma.tAMilestone.update({
    where: { id: existing.id },
    data: {
      ...result.data,
      dueDate: parseDueDate(result.data.dueDate),
    },
  });

  refreshMilestonePages();
  redirect("/dashboard/ta-progress");
}

export async function deleteMilestone(id: string) {
  const user = await requireUser();

  await prisma.tAMilestone.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  refreshMilestonePages();
}
