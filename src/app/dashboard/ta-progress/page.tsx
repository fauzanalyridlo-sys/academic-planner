export const instant = false;

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Plus,
  Trash2,
  Target,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { createMilestone } from "./actions";
import DeleteMilestoneButton from "@/components/delete-milestone-button";

const statusLabels = {
  NOT_STARTED: "Belum dimulai",
  IN_PROGRESS: "Sedang dikerjakan",
  COMPLETED: "Selesai",
  BLOCKED: "Terhambat",
} as const;

const statusStyles = {
  NOT_STARTED: "bg-white",
  IN_PROGRESS: "bg-[#83D8FF]",
  COMPLETED: "bg-[#B8F56A]",
  BLOCKED: "bg-[#FF9292]",
} as const;

function formatDate(date: Date | null) {
  if (!date) return "Belum ditentukan";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function TAProgressPage() {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const milestones = await prisma.tAMilestone.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const total = milestones.length;
  const completed = milestones.filter(
    (milestone) => milestone.status === "COMPLETED",
  ).length;
  const inProgress = milestones.filter(
    (milestone) => milestone.status === "IN_PROGRESS",
  ).length;
  const progress =
    total === 0 ? 0 : Math.round((completed / total) * 100);

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

        <header className="mb-8">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">
            Academic Command / Final Project
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
            TA Progress<span className="text-[#8C6BFF]">.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-neutral-700 sm:text-base">
            Pantau setiap tahapan Tugas Akhir dan selesaikan satu per satu.
          </p>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="TOTAL MILESTONE" value={total} color="bg-white" />
          <StatCard
            label="SEDANG DIKERJAKAN"
            value={inProgress}
            color="bg-[#83D8FF]"
          />
          <StatCard
            label="SELESAI"
            value={completed}
            color="bg-[#B8F56A]"
          />
        </section>

        <section className="mb-8 border-2 border-black bg-[#FFE14D] p-5 shadow-[6px_6px_0px_#000] sm:p-7">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Target size={26} />
              <h2 className="text-xl font-black">Progres Keseluruhan</h2>
            </div>
            <span className="text-3xl font-black">{progress}%</span>
          </div>

          <div
            className="h-5 border-2 border-black bg-white"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progres keseluruhan TA"
          >
            <div
              className="h-full border-r-2 border-black bg-[#B8F56A] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-3 text-sm font-bold">
            {completed} dari {total} milestone selesai.
          </p>
        </section>

        <section className="mb-8 border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="border-b-2 border-black px-5 py-4 sm:px-7">
            <h2 className="text-xl font-black">Tambah Milestone</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Catat tahapan penting dalam perjalanan TA-mu.
            </p>
          </div>

          <form
            action={createMilestone}
            className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7"
          >
            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Judul milestone
              <input
                name="title"
                required
                maxLength={150}
                placeholder="Contoh: Menentukan judul TA"
                className="border-2 border-black bg-[#FFF9EB] px-4 py-3 font-medium outline-none focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold sm:col-span-2">
              Deskripsi
              <textarea
                name="description"
                rows={3}
                maxLength={5000}
                placeholder="Catatan atau target yang ingin dicapai..."
                className="resize-y border-2 border-black bg-[#FFF9EB] px-4 py-3 font-medium outline-none focus:bg-white"
              />
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Status
              <select
                name="status"
                defaultValue="NOT_STARTED"
                className="border-2 border-black bg-white px-4 py-3"
              >
                <option value="NOT_STARTED">Belum dimulai</option>
                <option value="IN_PROGRESS">Sedang dikerjakan</option>
                <option value="COMPLETED">Selesai</option>
                <option value="BLOCKED">Terhambat</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-bold">
              Target tanggal
              <input
                name="dueDate"
                type="date"
                className="border-2 border-black bg-white px-4 py-3"
              />
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <Plus size={18} />
                Tambah Milestone
              </button>
            </div>
          </form>
        </section>

        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black px-5 py-4 sm:px-7">
            <h2 className="text-xl font-black">Roadmap TA</h2>
            <span className="text-sm font-bold">{total} milestone</span>
          </div>

          {milestones.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-2 border-black bg-[#B9A0FF]">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-black">Roadmap masih kosong</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Tambahkan milestone pertama melalui formulir di atas.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {milestones.map((milestone) => (
                <article
                  key={milestone.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-7"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black ${statusStyles[milestone.status]}`}
                    >
                      {milestone.status === "COMPLETED" ? (
                        <CheckCircle2 size={22} />
                      ) : milestone.status === "IN_PROGRESS" ? (
                        <Clock3 size={22} />
                      ) : (
                        <Circle size={22} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black">
                        {milestone.title}
                      </h3>

                      {milestone.description && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-600">
                          {milestone.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`border-2 border-black px-2 py-1 text-xs font-black ${statusStyles[milestone.status]}`}
                        >
                          {statusLabels[milestone.status]}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600">
                          <CalendarDays size={14} />
                          {formatDate(milestone.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                 <div className="flex items-center gap-2">
  <Link
    href={`/dashboard/ta-progress/${milestone.id}/edit`}
    aria-label={`Edit ${milestone.title}`}
    className="flex h-10 items-center justify-center border-2 border-black bg-[#83D8FF] px-3 font-bold hover:bg-sky-300"
  >
    Edit
  </Link>

  <DeleteMilestoneButton
  id={milestone.id}
  title={milestone.title}
/>
</div>
</article>
))}
            </div>
          )}
        </section>
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
    <article
      className={`border-2 border-black p-5 shadow-[4px_4px_0px_#000] ${color}`}
    >
      <p className="text-xs font-black tracking-widest">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </article>
  );
}
