export const instant = false;

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRightCircle,
  CalendarDays,
  Clock3,
  MapPin,
  Plus,
} from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";

const categoryStyles: Record<string, string> = {
  TA: "bg-[#B9A0FF]",
  KULIAH: "bg-[#83D8FF]",
  MAGANG: "bg-[#B8F56A]",
  PRIBADI: "bg-[#FFE14D]",
};

const categoryLabels: Record<string, string> = {
  TA: "TUGAS AKHIR",
  KULIAH: "KULIAH",
  MAGANG: "MAGANG",
  PRIBADI: "PRIBADI",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(Date.UTC(year, month, 1, 12)));
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const params = await searchParams;
  const today = new Date();

  let year = today.getFullYear();
  let month = today.getMonth();

  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [parsedYear, parsedMonth] = params.month.split("-").map(Number);

    if (
      parsedYear >= 2000 &&
      parsedYear <= 2100 &&
      parsedMonth >= 1 &&
      parsedMonth <= 12
    ) {
      year = parsedYear;
      month = parsedMonth - 1;
    }
  }

  const currentMonth = `${year}-${String(month + 1).padStart(2, "0")}`;

  const previousDate = new Date(Date.UTC(year, month - 1, 1, 12));
  const nextDate = new Date(Date.UTC(year, month + 1, 1, 12));

  const previousMonth = `${previousDate.getUTCFullYear()}-${String(
    previousDate.getUTCMonth() + 1,
  ).padStart(2, "0")}`;

  const nextMonth = `${nextDate.getUTCFullYear()}-${String(
    nextDate.getUTCMonth() + 1,
  ).padStart(2, "0")}`;

  const events = await prisma.event.findMany({
    where: {
      userId,
      startAt: {
        gte: new Date(`${currentMonth}-01T00:00:00+07:00`),
        lt: new Date(
          `${nextMonth}-01T00:00:00+07:00`,
        ),
      },
    },
    orderBy: [{ startAt: "asc" }],
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDay = new Date(year, month, 1).getDay();
  const calendarOffset = (firstDay + 6) % 7;

  const todayKey = dateKey(today);

  const eventsByDay = new Map<string, typeof events>();

  for (const event of events) {
    const key = dateKey(event.startAt);
    const dayEvents = eventsByDay.get(key) ?? [];

    dayEvents.push(event);
    eventsByDay.set(key, dayEvents);
  }

  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(Date.UTC(year, month, day, 12));

    return {
      day,
      key: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      weekday: date.getUTCDay(),
    };
  });

  const upcomingEvents = events.filter(
    (event) => event.startAt.getTime() >= today.getTime(),
  );

  return (
    <main className="min-h-screen bg-[#FFF9EB] px-4 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
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
              Academic Command / Calendar
            </p>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Academic Calendar<span className="text-[#8C6BFF]">.</span>
            </h1>

            <p className="mt-3 max-w-xl text-sm text-neutral-700 sm:text-base">
              Semua jadwal pentingmu dalam satu tempat.
            </p>
          </div>

          <Link
            href="/dashboard/calendar/new"
            className="inline-flex items-center justify-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <Plus size={20} />
            Tambah Jadwal
          </Link>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="JADWAL BULAN INI"
            value={events.length}
            color="bg-white"
          />

          <StatCard
            label="AGENDA MENDATANG"
            value={upcomingEvents.length}
            color="bg-[#83D8FF]"
          />

          <StatCard
            label="KATEGORI"
            value={new Set(events.map((event) => event.category)).size}
            color="bg-[#B8F56A]"
          />
        </section>

        <section className="mb-8 border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="flex flex-col gap-4 border-b-2 border-black p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                Tampilan Bulanan
              </p>

              <h2 className="mt-1 text-2xl font-black capitalize sm:text-3xl">
                {monthLabel(year, month)}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/calendar?month=${previousMonth}`}
                aria-label="Bulan sebelumnya"
                className="flex h-11 w-11 items-center justify-center border-2 border-black bg-white hover:bg-[#83D8FF]"
              >
                <ArrowLeftCircle size={22} />
              </Link>

              <Link
                href="/dashboard/calendar"
                className="flex h-11 items-center justify-center border-2 border-black bg-[#FFE14D] px-4 text-sm font-black"
              >
                Hari ini
              </Link>

              <Link
                href={`/dashboard/calendar?month=${nextMonth}`}
                aria-label="Bulan berikutnya"
                className="flex h-11 w-11 items-center justify-center border-2 border-black bg-white hover:bg-[#B8F56A]"
              >
                <ArrowRightCircle size={22} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b-2 border-black bg-[#FFF9EB]">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map(
              (weekday) => (
                <div
                  key={weekday}
                  className="border-r border-black px-1 py-3 text-center text-xs font-black last:border-r-0 sm:text-sm"
                >
                  {weekday}
                </div>
              ),
            )}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: calendarOffset }, (_, index) => (
              <div
                key={`empty-${index}`}
                className="min-h-20 border-b border-r border-black bg-neutral-100/70 sm:min-h-28"
              />
            ))}

            {days.map((day) => {
              const dayEvents = eventsByDay.get(day.key) ?? [];
              const isToday = day.key === todayKey;

              return (
                <div
                  key={day.key}
                  className={`min-w-0 border-b border-r border-black p-1 sm:min-h-28 sm:p-2 ${
                    isToday ? "bg-[#FFE14D]/40" : "bg-white"
                  }`}
                >
                  <div
                    className={`mb-1 flex h-7 w-7 items-center justify-center text-xs font-black sm:h-8 sm:w-8 sm:text-sm ${
                      isToday
                        ? "border-2 border-black bg-[#FFE14D]"
                        : ""
                    }`}
                  >
                    {day.day}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <Link
                        key={event.id}
                        href={`/dashboard/calendar/${event.id}/edit`}
                        title={event.title}
                        className={`block overflow-hidden border border-black px-1 py-1 text-[9px] font-black leading-tight sm:text-xs ${
                          categoryStyles[event.category] ?? "bg-white"
                        }`}
                      >
                        <span className="hidden sm:inline">
                          {!event.allDay && `${formatTime(event.startAt)} `}
                        </span>
                        <span className="break-words">{event.title}</span>
                      </Link>
                    ))}

                    {dayEvents.length > 2 && (
                      <p className="px-1 text-[9px] font-black sm:text-xs">
                        +{dayEvents.length - 2} lagi
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 border-t-2 border-black p-4">
            {Object.entries(categoryLabels).map(([category, label]) => (
              <span
                key={category}
                className={`border-2 border-black px-3 py-1 text-xs font-black ${
                  categoryStyles[category]
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        <section className="border-2 border-black bg-white shadow-[6px_6px_0px_#000]">
          <div className="flex items-center justify-between border-b-2 border-black px-5 py-4 sm:px-7">
            <h2 className="text-xl font-black">Agenda Bulan Ini</h2>
            <CalendarDays size={22} />
          </div>

          {events.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-2 border-black bg-[#FFE14D]">
                <CalendarDays size={32} />
              </div>

              <h3 className="text-2xl font-black">Kalender masih kosong!</h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
                Tambahkan jadwal bimbingan, deadline, kuliah, atau kegiatan
                magang pertamamu.
              </p>

              <Link
                href="/dashboard/calendar/new"
                className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <Plus size={18} />
                Buat Jadwal Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center border-2 border-black ${
                        categoryStyles[event.category] ?? "bg-white"
                      }`}
                    >
                      <CalendarDays size={23} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-black">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-neutral-600">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-neutral-600 sm:text-sm">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={15} />
                          {formatDate(event.startAt)}
                          {!event.allDay && ` · ${formatTime(event.startAt)}`}
                        </span>

                        {event.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={15} />
                            {event.location}
                          </span>
                        )}
                      </div>

                      <span
                        className={`mt-3 inline-flex border-2 border-black px-2 py-1 text-xs font-black ${
                          categoryStyles[event.category] ?? "bg-white"
                        }`}
                      >
                        {categoryLabels[event.category] ?? event.category}
                      </span>

                      {event.reminderMinutes !== null && (
                        <p className="mt-2 text-xs font-bold text-neutral-500">
                          Pengingat dipilih:{" "}
                          {event.reminderMinutes === 0
                            ? "Saat kegiatan dimulai"
                            : event.reminderMinutes < 60
                              ? `${event.reminderMinutes} menit sebelumnya`
                              : event.reminderMinutes < 1440
                                ? `${event.reminderMinutes / 60} jam sebelumnya`
                                : `${event.reminderMinutes / 1440} hari sebelumnya`}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/calendar/${event.id}/edit`}
                    className="inline-flex shrink-0 items-center justify-center border-2 border-black bg-[#83D8FF] px-4 py-2 text-sm font-black hover:bg-[#B9A0FF]"
                  >
                    Edit Jadwal
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs font-bold text-neutral-500">
          ACADEMIC PLANNER · PLAN YOUR NEXT MOVE.
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
      <p className="text-xs font-black uppercase tracking-widest">{label}</p>
      <p className="mt-3 text-4xl font-black">{value}</p>
    </div>
  );
}
