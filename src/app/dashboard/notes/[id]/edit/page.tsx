export const instant = false;

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, FileText, Save } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { updateNote } from "../../actions";

type EditNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const { id } = await params;

  const note = await prisma.note.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!note) notFound();

  return (
    <main className="min-h-screen bg-[#FFF9EB] px-4 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/notes"
          className="mb-8 inline-flex items-center gap-2 font-bold hover:underline"
        >
          <ArrowLeft size={18} />
          Kembali ke Notes
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">
            Academic Command / Notes / Edit
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            Edit Note<span className="text-[#8C6BFF]">.</span>
          </h1>
          <p className="mt-3 text-sm text-neutral-700 sm:text-base">
            Perbarui catatanmu agar informasinya tetap relevan.
          </p>
        </header>

        <form
          action={updateNote.bind(null, note.id)}
          className="space-y-6 border-2 border-black bg-white p-5 shadow-[6px_6px_0px_#000] sm:p-8"
        >
          <div className="flex items-center gap-3 border-b-2 border-black pb-5">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-[#83D8FF]">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black">Detail Catatan</h2>
              <p className="text-xs font-medium text-neutral-600">
                Ubah informasi catatanmu.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="mb-2 block text-sm font-black">
              Judul Catatan
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              defaultValue={note.title}
              className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#8C6BFF]"
            />
          </div>

          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-black">
              Isi Catatan
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              maxLength={10000}
              defaultValue={note.content}
              className="w-full resize-y border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#8C6BFF]"
            />
            <p className="mt-2 text-xs text-neutral-500">
              Maksimal 10.000 karakter.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 border-2 border-black bg-[#FFF9EB] p-4">
            <input
              type="checkbox"
              name="isPinned"
              defaultChecked={note.isPinned}
              className="h-5 w-5 accent-black"
            />
            <span>
              <span className="block font-black">Sematkan catatan</span>
              <span className="text-xs text-neutral-600">
                Catatan ini akan ditampilkan lebih dahulu.
              </span>
            </span>
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/notes"
              className="border-2 border-black bg-white px-5 py-3 text-center font-black hover:bg-neutral-100"
            >
              Batal
            </Link>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Save size={18} />
              Simpan Perubahan
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs font-bold text-neutral-500">
          ACADEMIC PLANNER · KEEP YOUR IDEAS UPDATED.
        </p>
      </div>
    </main>
  );
}
