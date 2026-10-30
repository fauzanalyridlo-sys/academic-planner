export const instant = false;

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { updateMilestone } from "../../actions";

type EditMilestonePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMilestonePage({
  params,
}: EditMilestonePageProps) {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const { id } = await params;

  const milestone = await prisma.tAMilestone.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!milestone) notFound();

  const action = updateMilestone.bind(null, milestone.id);

  const dueDate = milestone.dueDate
    ? milestone.dueDate.toISOString().slice(0, 10)
    : "";

  return (
    <main className="min-h-screen bg-[#FFF9EB] px-5 py-8 text-black md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/ta-progress"
          className="mb-10 inline-flex items-center gap-2 font-bold hover:underline"
        >
          <ArrowLeft size={20} />
          Kembali ke TA Progress
        </Link>

        <p className="mb-3 text-sm font-black uppercase tracking-[0.25em]">
          Academic Command / Final Project
        </p>

        <h1 className="mb-3 text-5xl font-black tracking-tight md:text-6xl">
          Edit Milestone<span className="text-[#B9A0FF]">.</span>
        </h1>

        <p className="mb-8 text-lg text-gray-700">
          Perbarui tahapan dan status perjalanan tugas akhirmu.
        </p>

        <form
          action={action}
          className="space-y-6 border-2 border-black bg-white p-6 shadow-[7px_7px_0px_#000] md:p-8"
        >
          <div>
            <label
              htmlFor="title"
              className="mb-2 block font-black"
            >
              Judul Milestone
            </label>

            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              defaultValue={milestone.title}
              className="w-full border-2 border-black px-4 py-3 outline-none focus:bg-[#FFF9EB]"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block font-black"
            >
              Deskripsi
            </label>

            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={5000}
              defaultValue={milestone.description ?? ""}
              className="w-full border-2 border-black px-4 py-3 outline-none focus:bg-[#FFF9EB]"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block font-black"
            >
              Status
            </label>

            <select
              id="status"
              name="status"
              defaultValue={milestone.status}
              className="w-full border-2 border-black bg-white px-4 py-3 outline-none focus:bg-[#FFF9EB]"
            >
              <option value="NOT_STARTED">Belum dimulai</option>
              <option value="IN_PROGRESS">Sedang dikerjakan</option>
              <option value="COMPLETED">Selesai</option>
              <option value="BLOCKED">Terhambat</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="mb-2 block font-black"
            >
              Deadline
            </label>

            <input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={dueDate}
              className="w-full border-2 border-black px-4 py-3 outline-none focus:bg-[#FFF9EB]"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 border-2 border-black bg-[#B8F56A] px-6 py-3 font-black shadow-[4px_4px_0px_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]"
            >
              <Save size={18} />
              Simpan Perubahan
            </button>

            <Link
              href="/dashboard/ta-progress"
              className="border-2 border-black bg-white px-6 py-3 font-bold shadow-[4px_4px_0px_#000] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
