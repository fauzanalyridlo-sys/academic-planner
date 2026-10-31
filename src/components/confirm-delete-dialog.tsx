"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

type ConfirmDeleteDialogProps = {
  formAction: (formData: FormData) => void | Promise<void>;
  title?: string;
  description?: string;
};

export default function ConfirmDeleteDialog({
  formAction,
  title = "Yakin ingin menghapus?",
  description = "Data yang dihapus tidak dapat dikembalikan.",
}: ConfirmDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 border-2 border-black bg-[#FF9292] px-5 py-3 font-black hover:bg-red-300"
      >
        <Trash2 size={18} />
        Hapus Jadwal
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-description"
            className="w-full max-w-md border-2 border-black bg-[#FFF9EB] p-6 shadow-[8px_8px_0px_#000]"
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-[#FF9292]">
                <AlertTriangle size={28} />
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup dialog"
                className="border-2 border-black bg-white p-2 hover:bg-neutral-100"
              >
                <X size={18} />
              </button>
            </div>

            <h2
              id="confirm-delete-title"
              className="text-2xl font-black tracking-tight"
            >
              {title}
            </h2>

            <p
              id="confirm-delete-description"
              className="mt-3 text-sm leading-relaxed text-neutral-700"
            >
              {description}
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="border-2 border-black bg-white px-5 py-3 font-black hover:bg-neutral-100"
              >
                Batal
              </button>

              <button
                type="submit"
                formAction={formAction}
                formNoValidate
                className="flex items-center justify-center gap-2 border-2 border-black bg-[#FF9292] px-5 py-3 font-black shadow-[4px_4px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                <Trash2 size={18} />
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
