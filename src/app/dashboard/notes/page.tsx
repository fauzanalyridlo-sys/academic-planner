export const instant = false;

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  FileText,
  Pin,
  PinOff,
  Pencil,
  Plus,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";
import { deleteNote, toggleNotePin } from "./actions";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function NotesPage() {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const notes = await prisma.note.findMany({
    where: { userId },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });

  const totalNotes = notes.length;
  const pinnedNotes = notes.filter((note) => note.isPinned).length;
  const regularNotes = totalNotes - pinnedNotes;

  return (
    <main className="min-h-screen bg-[#FFF9EB] px-4 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 font-bold hover:underline"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard
        </Link>

        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">
              Academic Command / Notes
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              My Notes<span className="text-[#8C6BFF]">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-neutral-700 sm:text-base">
              Simpan ide, catatan kuliah, dan hal penting dalam satu tempat.
            </p>
          </div>

          <Link
            href="/dashboard/notes/new"
            className="inline-flex items-center justify-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Plus size={20} />
            Tambah Catatan
          </Link>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="TOTAL CATATAN" value={totalNotes} color="bg-white" />
          <StatCard
            label="DISEMATKAN"
            value={pinnedNotes}
            color="bg-[#FFE14D]"
          />
          <StatCard
            label="CATATAN BIASA"
            value={regularNotes}
            color="bg-[#83D8FF]"
          />
        </section>

        {notes.length === 0 ? (
          <section className="border-2 border-black bg-white px-6 py-16 text-center shadow-[6px_6px_0px_#000]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-2 border-black bg-[#FFE14D]">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-black">Belum ada catatan!</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
              Mulai kumpulkan ide dan informasi penting dengan membuat catatan
              pertamamu.
            </p>
            <Link
              href="/dashboard/notes/new"
              className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Plus size={18} />
              Buat Catatan Pertama
            </Link>
          </section>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="flex min-h-64 flex-col border-2 border-black bg-white shadow-[6px_6px_0px_#000]"
              >
                <div className="flex items-start justify-between gap-3 border-b-2 border-black px-5 py-4">
                  <h2 className="min-w-0 break-words text-lg font-black">
                    {note.title}
                  </h2>

                  {note.isPinned && (
                    <span className="flex shrink-0 items-center gap-1 border-2 border-black bg-[#FFE14D] px-2 py-1 text-xs font-black">
                      <Pin size={12} />
                      PIN
                    </span>
                  )}
                </div>

                <div className="flex-1 px-5 py-4">
                  <p className="max-h-32 overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-700">
                    {note.content || "Belum ada isi catatan."}
                  </p>
                </div>

                <div className="border-t-2 border-black px-5 py-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500">
                    <Clock3 size={13} />
                    Diperbarui {formatDate(note.updatedAt)}
                  </span>

                  <div className="mt-4 flex items-center gap-2">
                    <form action={toggleNotePin.bind(null, note.id)}>
                      <button
                        type="submit"
                        aria-label={
                          note.isPinned
                            ? `Lepas pin ${note.title}`
                            : `Sematkan ${note.title}`
                        }
                        title={note.isPinned ? "Lepas pin" : "Sematkan"}
                        className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#FFE14D] hover:bg-[#FFD65A]"
                      >
                        {note.isPinned ? (
                          <PinOff size={17} />
                        ) : (
                          <Pin size={17} />
                        )}
                      </button>
                    </form>

                    <Link
                      href={`/dashboard/notes/${note.id}/edit`}
                      aria-label={`Edit ${note.title}`}
                      title="Edit catatan"
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#83D8FF] hover:bg-[#B9A0FF]"
                    >
                      <Pencil size={17} />
                    </Link>

                    <form>
                      <ConfirmDeleteDialog
                        formAction={deleteNote.bind(null, note.id)}
                        buttonLabel="Hapus Catatan"
                        title="Hapus catatan ini?"
                        description={`Catatan "${note.title}" akan dihapus permanen dan tidak dapat dikembalikan.`}
                      />
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <p className="mt-8 text-center text-xs font-bold text-neutral-500">
          ACADEMIC PLANNER · KEEP YOUR IDEAS ORGANIZED.
        </p>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={`border-2 border-black p-5 shadow-[4px_4px_0px_#000] ${color}`}
    >
      <p className="text-xs font-black tracking-wider">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}
