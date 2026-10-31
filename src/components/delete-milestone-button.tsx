"use client";

import { useState, useTransition } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { deleteMilestone } from "@/app/dashboard/ta-progress/actions";

type DeleteMilestoneButtonProps = {
  id: string;
  title: string;
};

export default function DeleteMilestoneButton({
  id,
  title,
}: DeleteMilestoneButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteMilestone(id);
      setIsOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Hapus ${title}`}
        className="flex h-10 w-10 items-center justify-center border-2 border-black bg-[#FF9292] hover:bg-red-400"
      >
        <Trash2 size={18} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isPending) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-milestone-title"
            aria-describedby="delete-milestone-description"
            className="w-full max-w-md border-[3px] border-black bg-[#FFF9EB] p-6 shadow-[8px_8px_0px_#000] sm:p-8"
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center border-2 border-black bg-[#FF9292]">
              <AlertTriangle size={30} strokeWidth={2.5} />
            </div>

            <h2
              id="delete-milestone-title"
              className="text-2xl font-black"
            >
              Yakin ingin menghapus?
            </h2>

            <p
              id="delete-milestone-description"
              className="mt-3 break-words text-sm leading-relaxed text-gray-700"
            >
              Milestone <strong>“{title}”</strong> akan dihapus secara
              permanen. Tindakan ini tidak bisa dibatalkan.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 border-2 border-black bg-white px-4 py-3 font-black shadow-[3px_3px_0px_#000] hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={18} />
                Batal
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 border-2 border-black bg-[#FF9292] px-4 py-3 font-black shadow-[3px_3px_0px_#000] hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={18} />
                {isPending ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
