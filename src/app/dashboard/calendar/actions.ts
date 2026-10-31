"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

function isValidLocalDateTime(value: string): boolean {
  // Format input dari HTML datetime-local: YYYY-MM-DDTHH:mm
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) return false;

  const [, year, month, day, hour, minute] = match;

  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ),
  );

  // Menolak tanggal seperti 31 Februari atau jam di luar rentang.
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day) &&
    date.getUTCHours() === Number(hour) &&
    date.getUTCMinutes() === Number(minute)
  );
}

const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Judul kegiatan wajib diisi.")
      .max(150),

    description: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .transform((value) => value || null),

    startAt: z.string().min(1, "Tanggal dan waktu mulai wajib diisi."),

    endAt: z
      .string()
      .optional()
      .transform((value) => value || null),

    allDay: z.boolean(),

    location: z
      .string()
      .trim()
      .max(250)
      .optional()
      .transform((value) => value || null),

    category: z.enum(["TA", "KULIAH", "MAGANG", "PRIBADI"]),

    reminderMinutes: z
      .union([
        z.literal(0),
        z.literal(60),
        z.literal(1440),
        z.literal(10080),
      ])
      .nullable(),
  })
  .refine((data) => isValidLocalDateTime(data.startAt), {
    message: "Tanggal dan waktu mulai tidak valid.",
    path: ["startAt"],
  })
  .refine(
    (data) => !data.endAt || isValidLocalDateTime(data.endAt),
    {
      message: "Tanggal dan waktu selesai tidak valid.",
      path: ["endAt"],
    },
  )
  .refine(
    (data) => {
      if (!data.endAt) return true;

      const start = new Date(`${data.startAt}+07:00`);
      const end = new Date(`${data.endAt}+07:00`);

      return end >= start;
    },
    {
      message: "Waktu selesai tidak boleh sebelum waktu mulai.",
      path: ["endAt"],
    },
  );

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

function parseEventForm(formData: FormData) {
  const rawReminder = formData.get("reminderMinutes");
  const reminderValue =
    rawReminder === null || rawReminder === ""
      ? null
      : Number(rawReminder);

  return eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt") || undefined,
    allDay: formData.get("allDay") === "on",
    location: formData.get("location") || undefined,
    category: formData.get("category") || "TA",
    reminderMinutes: reminderValue,
  });
}

function parseDate(value: string): Date {
  if (!isValidLocalDateTime(value)) {
    throw new Error("Tanggal atau waktu tidak valid.");
  }

  return new Date(`${value}+07:00`);
}

export async function createEvent(formData: FormData) {
  const user = await requireUser();
  const result = parseEventForm(formData);

  if (!result.success) {
  const firstIssue = result.error.issues[0];
  const field = firstIssue?.path[0];

  const allowedFields = [
    "title",
    "startAt",
    "endAt",
    "category",
    "location",
    "description",
    "reminderMinutes",
  ];

  const errorField =
    typeof field === "string" && allowedFields.includes(field)
      ? field
      : "general";

  redirect(`/dashboard/calendar/new?error=${errorField}`);
}

  const data = result.data;

  await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      startAt: parseDate(data.startAt),
      endAt: data.endAt ? parseDate(data.endAt) : null,
      allDay: data.allDay,
      location: data.location,
      category: data.category,
      reminderMinutes: data.reminderMinutes,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/calendar");
}

export async function updateEvent(id: string, formData: FormData) {
  const user = await requireUser();
  const result = parseEventForm(formData);

  if (!result.success) {
  const firstIssue = result.error.issues[0];
  const field = firstIssue?.path[0];

  const allowedFields = [
    "title",
    "startAt",
    "endAt",
    "category",
    "location",
    "description",
    "reminderMinutes",
  ];

  const errorField =
    typeof field === "string" && allowedFields.includes(field)
      ? field
      : "general";

  redirect(
    `/dashboard/calendar/${id}/edit?error=${errorField}`,
  );
}

  const existingEvent = await prisma.event.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!existingEvent) {
    throw new Error("Jadwal tidak ditemukan.");
  }

  const data = result.data;

  await prisma.event.update({
    where: { id: existingEvent.id },
    data: {
      title: data.title,
      description: data.description,
      startAt: parseDate(data.startAt),
      endAt: data.endAt ? parseDate(data.endAt) : null,
      allDay: data.allDay,
      location: data.location,
      category: data.category,
      reminderMinutes: data.reminderMinutes,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/calendar");
}

export async function deleteEvent(id: string) {
  const user = await requireUser();

  await prisma.event.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");

  redirect("/dashboard/calendar");
}
