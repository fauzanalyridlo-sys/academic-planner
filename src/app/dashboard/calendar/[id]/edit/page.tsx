export const instant = false;

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarPlus, Trash2 } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { validateIdleSession } from "@/lib/session";
import ConfirmDeleteButton from "@/components/confirm-delete-button";
import ConfirmDeleteDialog from "@/components/confirm-delete-dialog";

import { updateEvent, deleteEvent } from "../../actions";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

function toJakartaInputValue(date: Date | null) {
  if (!date) return "";

  const jakartaDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }),
  );

  const year = jakartaDate.getFullYear();
  const month = String(jakartaDate.getMonth() + 1).padStart(2, "0");
  const day = String(jakartaDate.getDate()).padStart(2, "0");
  const hours = String(jakartaDate.getHours()).padStart(2, "0");
  const minutes = String(jakartaDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default async function EditEventPage({
  params,
  searchParams,
}: EditEventPageProps) {
  const isSessionValid = await validateIdleSession();

  if (!isSessionValid) redirect("/login");

  const { error } = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;

  if (typeof userId !== "string" || !userId) {
    redirect("/login");
  }

  const { id } = await params;

  const event = await prisma.event.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!event) notFound();

  const updateEventWithId = updateEvent.bind(null, event.id);
  const deleteEventWithId = deleteEvent.bind(null, event.id);

  return (
    <main className="min-h-screen bg-[#FFF9EB] px-4 py-8 text-black sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/dashboard/calendar"
          className="mb-8 inline-flex items-center gap-2 font-bold hover:underline"
        >
          <ArrowLeft size={18} />
          Kembali ke Kalender
        </Link>

        <header className="mb-8">
          <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">
            Academic Command / Edit Event
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Edit Jadwal<span className="text-[#8C6BFF]">.</span>
          </h1>

          <p className="mt-3 text-sm text-neutral-700 sm:text-base">
            Perbarui informasi kegiatanmu.
          </p>
        </header>

        <form
          action={updateEventWithId}
          className="space-y-6 border-2 border-black bg-white p-5 shadow-[6px_6px_0px_#000] sm:p-8"
        >
          {error === "invalid" && (
  <div
    role="alert"
    className="border-2 border-black bg-[#FF9292] p-4 font-bold"
  >
    Data jadwal tidak valid. Periksa tanggal, waktu mulai, dan waktu selesai.
  </div>
)}
          <div>
            <label htmlFor="title" className="mb-2 block font-black">
              Nama kegiatan *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              defaultValue={event.title}
              className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-[#FFE14D]/30"
            />
            {error === "title" && (
  <p role="alert" className="mt-2 text-sm font-bold text-red-600">
    Judul kegiatan wajib diisi dan maksimal 150 karakter.
  </p>
)}
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block font-black">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              maxLength={5000}
              defaultValue={event.description ?? ""}
              className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-[#FFE14D]/30"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startAt" className="mb-2 block font-black">
                Tanggal dan waktu mulai *
              </label>
              <input
                id="startAt"
                name="startAt"
                type="datetime-local"
                required
                defaultValue={toJakartaInputValue(event.startAt)}
                className="w-full min-w-0 border-2 border-black bg-[#FFF9EB] px-3 py-3 outline-none focus:bg-[#FFE14D]/30"
              />
              {error === "startAt" && (
  <p role="alert" className="mt-2 text-sm font-bold text-red-600">
    Tanggal dan waktu mulai tidak valid.
  </p>
)}
            </div>

            <div>
              <label htmlFor="endAt" className="mb-2 block font-black">
                Tanggal dan waktu selesai
              </label>
              <input
                id="endAt"
                name="endAt"
                type="datetime-local"
                defaultValue={toJakartaInputValue(event.endAt)}
                className="w-full min-w-0 border-2 border-black bg-[#FFF9EB] px-3 py-3 outline-none focus:bg-[#FFE14D]/30"
              />
              {error === "endAt" && (
  <p role="alert" className="mt-2 text-sm font-bold text-red-600">
    Waktu selesai tidak boleh sebelum waktu mulai.
  </p>
)}
            </div>
          </div>

          <label className="flex items-center gap-3 border-2 border-black bg-[#FFE14D]/40 p-4 font-bold">
            <input
              type="checkbox"
              name="allDay"
              defaultChecked={event.allDay}
              className="h-5 w-5 accent-black"
            />
            Kegiatan sepanjang hari
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-2 block font-black">
                Kategori *
              </label>
              <select
                id="category"
                name="category"
                defaultValue={event.category}
                required
                className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-[#FFE14D]/30"
              >
                <option value="TA">Tugas Akhir</option>
                <option value="KULIAH">Kuliah</option>
                <option value="MAGANG">Magang</option>
                <option value="PRIBADI">Pribadi</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block font-black">
                Lokasi
              </label>
              <input
                id="location"
                name="location"
                type="text"
                maxLength={250}
                defaultValue={event.location ?? ""}
                className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-[#FFE14D]/30"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="reminderMinutes"
              className="mb-2 block font-black"
            >
              Pengingat
            </label>
            <select
              id="reminderMinutes"
              name="reminderMinutes"
              defaultValue={event.reminderMinutes?.toString() ?? ""}
              className="w-full border-2 border-black bg-[#FFF9EB] px-4 py-3 outline-none focus:bg-[#FFE14D]/30"
            >
              <option value="">Tanpa pengingat</option>
              <option value="0">Saat kegiatan dimulai</option>
              <option value="60">1 jam sebelumnya</option>
              <option value="1440">1 hari sebelumnya</option>
              <option value="10080">1 minggu sebelumnya</option>
            </select>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <ConfirmDeleteDialog
  formAction={deleteEventWithId}
  title="Hapus jadwal ini?"
  description={`Jadwal "${event.title}" akan dihapus secara permanen dan tidak dapat dikembalikan.`}
/>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/calendar"
                className="flex items-center justify-center border-2 border-black bg-white px-5 py-3 font-black hover:bg-neutral-100"
              >
                Batal
              </Link>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 border-2 border-black bg-[#FFE14D] px-5 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <CalendarPlus size={20} />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
