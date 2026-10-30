export const instant = false;

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import { deleteTask } from "./actions";


const statusLabels = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
} as const;

const priorityStyles = {
  LOW: "bg-[#B8F56A]",
  MEDIUM: "bg-[#83D8FF]",
  HIGH: "bg-[#FF9292]",
} as const;

const priorityLabels = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

function formatDate(date: Date | null) {
  if (!date) return "Tanpa deadline";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export default async function TasksPage() {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "DONE",
  ).length;
  const pendingTasks = totalTasks - completedTasks;

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
              Academic Command / Tasks
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              My Tasks<span className="text-[#8C6BFF]">.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-neutral-700 sm:text-base">
              Catat tugas, atur prioritas, dan selesaikan satu per satu.
            </p>
          </div>

          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center justify-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Plus size={20} />
            Tambah Tugas
          </Link>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="TOTAL TUGAS" value={totalTasks} color="bg-white" />
          <StatCard
            label="BELUM SELESAI"
            value={pendingTasks}
            color="bg-[#83D8FF]"
          />
          <StatCard
            label="SELESAI"
            value={completedTasks}
            color="bg-[#B8F56A]"
          />
        </section>

        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black px-5 py-4 sm:px-7">
            <h2 className="text-xl font-black">Daftar Tugas</h2>
            <span className="text-sm font-bold">
              {totalTasks} tugas
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-2 border-black bg-[#FFE14D]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black">Belum ada tugas!</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
                Mulai susun aktivitas akademikmu dengan menambahkan tugas
                pertama.
              </p>
              <Link
                href="/dashboard/tasks/new"
                className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <Plus size={18} />
                Buat Tugas Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {tasks.map((task) => (
                <article
                  key={task.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black ${
                        task.status === "DONE"
                          ? "bg-[#B8F56A]"
                          : task.status === "IN_PROGRESS"
                            ? "bg-[#83D8FF]"
                            : "bg-[#FFF9EB]"
                      }`}
                    >
                      {task.status === "DONE" ? (
                        <CheckCircle2 size={22} />
                      ) : task.status === "IN_PROGRESS" ? (
                        <Clock3 size={22} />
                      ) : (
                        <Circle size={22} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={`break-words text-lg font-black ${
                          task.status === "DONE"
                            ? "text-neutral-500 line-through"
                            : ""
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-600">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="border-2 border-black px-2 py-1 text-xs font-black">
                          {statusLabels[task.status]}
                        </span>
                        <span
                          className={`border-2 border-black px-2 py-1 text-xs font-black ${priorityStyles[task.priority]}`}
                        >
                          {priorityLabels[task.priority]}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600">
                          <CalendarDays size={14} />
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                    <Link
                      href={`/dashboard/tasks/${task.id}/edit`}
                      aria-label={`Edit ${task.title}`}
                      className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#83D8FF] hover:bg-[#B9A0FF]"
                    >
                      <Pencil size={18} />
                    </Link>

                    <form action={deleteTask.bind(null, task.id)}>
                      <button
                        type="submit"
                        aria-label={`Hapus ${task.title}`}
                        className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#FF9292] hover:bg-red-400"
                      >
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs font-bold text-neutral-500">
          ACADEMIC PLANNER · ONE TASK AT A TIME.
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
