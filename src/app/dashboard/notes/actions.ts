"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { parseNoteForm } from "@/lib/note-validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

export async function createNote(formData: FormData) {
  const user = await requireUser();
  const result = parseNoteForm(formData);

  if (!result.success) {
    throw new Error("Data catatan tidak valid. Periksa kembali isianmu.");
  }

  await prisma.note.create({
    data: {
      ...result.data,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
  redirect("/dashboard/notes");
}

export async function updateNote(id: string, formData: FormData) {
  const user = await requireUser();
  const result = parseNoteForm(formData);

  if (!result.success) {
    throw new Error("Data catatan tidak valid. Periksa kembali isianmu.");
  }

  const updatedNote = await prisma.note.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: result.data,
  });

  if (updatedNote.count === 0) {
    throw new Error("Catatan tidak ditemukan.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
  redirect("/dashboard/notes");
}

export async function deleteNote(id: string) {
  const user = await requireUser();

  await prisma.note.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
}

export async function toggleNotePin(id: string) {
  const user = await requireUser();

  const note = await prisma.note.findFirst({
    where: { id, userId: user.id },
    select: { id: true, isPinned: true },
  });

  if (!note) {
    throw new Error("Catatan tidak ditemukan.");
  }

  await prisma.note.update({
    where: { id: note.id },
    data: { isPinned: !note.isPinned },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notes");
}
