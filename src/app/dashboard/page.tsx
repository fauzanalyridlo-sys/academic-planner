import SessionActivity from "@/components/session-activity";
import { validateIdleSession } from "@/lib/session";
import { connection } from "next/server";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Plus,
  Settings,
  Target,
} from "lucide-react";
export const instant = false;
const stats = [
  {
    label: "Total Tasks",
    value: "12",
    detail: "Tugas yang tercatat",
    color: "bg-[#FFE14D]",
    icon: CheckSquare,
  },
  {
    label: "Completed",
    value: "08",
    detail: "Tugas terselesaikan",
    color: "bg-[#B8F56A]",
    icon: Target,
  },
  {
    label: "Upcoming",
    value: "04",
    detail: "Perlu perhatian",
    color: "bg-[#83D8FF]",
    icon: CalendarDays,
  },
  {
    label: "TA Progress",
    value: "25%",
    detail: "Target tugas akhir",
    color: "bg-[#B9A0FF]",
    icon: GraduationCap,
  },
];

const upcomingTasks = [
  {
    title: "Menentukan topik tugas akhir",
    category: "TUGAS AKHIR",
    date: "Prioritas tinggi",
    color: "bg-[#B9A0FF]",
  },
  {
    title: "Persiapan sertifikasi BNSP",
    category: "SERTIFIKASI",
    date: "Perlu persiapan",
    color: "bg-[#83D8FF]",
  },
  {
    title: "Menyusun jadwal bimbingan",
    category: "AKADEMIK",
    date: "Belum dijadwalkan",
    color: "bg-[#B8F56A]",
  },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Tasks", icon: CheckSquare, active: false },
  { label: "Calendar", icon: CalendarDays, active: false },
  { label: "Notes", icon: NotebookPen, active: false },
  { label: "Documents", icon: FileText, active: false },
  { label: "TA Progress", icon: GraduationCap, active: false },
];

export default async function DashboardPage() {
  await connection();

  const isSessionValid = await validateIdleSession();

if (!isSessionValid) {
  redirect("/login");
}

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return (
  <>
    <SessionActivity />

    <main className="min-h-screen bg-[#FFF9EB] text-black">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r-[3px] border-black bg-white p-6 md:flex md:flex-col">
          <div className="mb-10">
            <div className="mb-3 inline-flex border-2 border-black bg-[#FFE14D] p-2">
              <GraduationCap size={26} strokeWidth={2.5} />
            </div>

            <h1 className="text-xl font-black tracking-tight">
              ACADEMIC
              <br />
              COMMAND.
            </h1>

            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              Your semester HQ
            </p>
          </div>

          <p className="mb-3 text-xs font-black uppercase tracking-widest text-gray-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 border-2 border-black px-3 py-3 font-bold ${
                    item.active
                      ? "translate-x-1 bg-[#FFE14D] shadow-[3px_3px_0px_#000]"
                      : "border-transparent"
                  }`}
                >
                  <Icon size={19} strokeWidth={2.5} />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 pt-8">
            <div className="flex items-center gap-3 px-3 py-3 font-bold text-gray-600">
              <Settings size={19} />
              Settings
            </div>

            <div className="flex items-center gap-3 px-3 py-3 font-bold text-gray-600">
              <LogOut size={19} />
              Sign out
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <header className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-gray-500">
                Personal academic workspace
              </p>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Dashboard<span className="text-[#7651E8]">.</span>
              </h2>

              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Atur progres kuliahmu, satu langkah dalam satu waktu.
              </p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 self-start border-[3px] border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] sm:self-auto"
            >
              <Plus size={20} strokeWidth={3} />
              New task
            </Link>
          </header>

          <section className="mb-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="border-[3px] border-black bg-white p-5 shadow-[5px_5px_0px_#000]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-sm font-bold">{stat.label}</span>

                    <div className={`border-2 border-black p-2 ${stat.color}`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                  </div>

                  <p className="text-4xl font-black tracking-tight">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs font-medium text-gray-500">
                    {stat.detail}
                  </p>
                </article>
              );
            })}
          </section>

          <section className="mb-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <article className="border-[3px] border-black bg-white p-6 shadow-[5px_5px_0px_#000] sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Stay on track
                  </p>

                  <h3 className="mt-2 text-2xl font-black">
                    Priority tasks
                  </h3>
                </div>

                <CheckSquare size={27} strokeWidth={2.5} />
              </div>

              <div className="space-y-4">
                {upcomingTasks.map((task, index) => (
                  <div
                    key={task.title}
                    className="flex items-start gap-4 border-2 border-black p-4"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black font-black ${task.color}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-black">{task.title}</h4>

                      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                        {task.category}
                      </p>

                      <p className="mt-3 text-xs font-medium text-gray-600">
                        {task.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-xs text-gray-500">
                Contoh tampilan — data tugas belum terhubung ke database.
              </p>
            </article>

            <article className="border-[3px] border-black bg-[#B9A0FF] p-6 shadow-[5px_5px_0px_#000] sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Final year project
                  </p>

                  <h3 className="mt-2 text-2xl font-black">TA Progress</h3>
                </div>

                <GraduationCap size={30} strokeWidth={2.5} />
              </div>

              <div className="mb-5 border-[3px] border-black bg-white p-5">
                <div className="mb-3 flex items-end justify-between">
                  <span className="text-sm font-bold">Overall progress</span>
                  <span className="text-3xl font-black">25%</span>
                </div>

                <div className="h-5 border-2 border-black bg-white">
                  <div className="h-full w-1/4 border-r-2 border-black bg-[#B8F56A]" />
                </div>
              </div>

              <p className="mb-5 text-sm font-medium leading-relaxed">
                Persiapkan topik, persyaratan akademik, dokumen, dan jadwal
                bimbinganmu dari satu tempat.
              </p>

              <div className="border-2 border-black bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Next milestone
                </p>

                <p className="mt-2 font-black">Menentukan judul TA</p>
              </div>
            </article>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <article className="border-[3px] border-black bg-[#83D8FF] p-6 shadow-[5px_5px_0px_#000]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Keep everything organized
                  </p>

                  <h3 className="mt-3 text-2xl font-black">
                    Your academic notes.
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-relaxed">
                    Simpan ide, materi, hasil diskusi, dan catatan bimbingan
                    supaya mudah ditemukan kembali.
                  </p>
                </div>

                <NotebookPen size={30} strokeWidth={2.5} />
              </div>
            </article>

            <article className="border-[3px] border-black bg-[#B8F56A] p-6 shadow-[5px_5px_0px_#000]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">
                    Ready for the next step
                  </p>

                  <h3 className="mt-3 text-2xl font-black">
                    Academic checklist.
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-relaxed">
                    Pantau sertifikasi, persyaratan TA, dan berkas yang perlu
                    kamu siapkan.
                  </p>
                </div>

                <FileText size={30} strokeWidth={2.5} />
              </div>
            </article>
          </section>

          <footer className="mt-10 border-t-2 border-black pt-5 text-xs font-bold text-gray-500">
            RD © 2026 · PLAN SMARTER, FINISH STRONGER.
          </footer>
        </section>
            </div>
    </main>
  </>
  );
}
