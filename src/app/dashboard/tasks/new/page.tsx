export const instant = false;

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Plus } from "lucide-react";

import { auth } from "@/auth";
import { validateIdleSession } from "@/lib/session";
import { createTask } from "../actions";


export default async function NewTaskPage() {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#FFF9EB] px-4 py-10 text-black sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/tasks"
          className="mb-8 inline-flex items-center gap-2 font-bold hover:underline"
        >
          <ArrowLeft size={18} />
          Kembali ke Daftar Tugas
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">
            Academic Command / Tasks / New
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Tugas Baru<span className="text-[#8C6BFF]">.</span>
          </h1>
          <p className="mt-3 text-neutral-700">
            Catat tugas akademikmu supaya tidak ada yang terlewat.
          </p>
        </header>

        <form
          action={createTask}
          className="space-y-6 border-2 border-black bg-white p-5 shadow-[6px_6px_0px_#000] sm:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-black uppercase"
            >
              Judul Tugas <span className="text-red-600">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              placeholder="Contoh: Menyusun proposal tugas akhir"
              className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#B9A0FF]"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-black uppercase"
            >
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={5000}
              placeholder="Detail tugas, catatan, atau hal yang perlu disiapkan..."
              className="w-full resize-y border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-[#B9A0FF]"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-black uppercase"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue="TODO"
                className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-[#B9A0FF]"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-black uppercase"
              >
                Prioritas
              </label>
              <select
                id="priority"
                name="priority"
                defaultValue="MEDIUM"
                className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-[#B9A0FF]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="mb-2 flex items-center gap-2 text-sm font-black uppercase"
            >
              <CalendarDays size={17} />
              Deadline (Opsional)
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-[#B9A0FF]"
            />
          </div>

          <div className="flex flex-col gap-3 border-t-2 border-black pt-6 sm:flex-row">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 border-2 border-black bg-[#FFE14D] px-6 py-3 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <Plus size={19} />
              Simpan Tugas
            </button>

            <Link
              href="/dashboard/tasks"
              className="inline-flex items-center justify-center border-2 border-black bg-white px-6 py-3 font-black hover:bg-neutral-100"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
