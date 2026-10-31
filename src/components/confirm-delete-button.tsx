"use client";

import { Trash2 } from "lucide-react";

type ConfirmDeleteButtonProps = {
  formAction: (formData: FormData) => void | Promise<void>;
};

export default function ConfirmDeleteButton({
  formAction,
}: ConfirmDeleteButtonProps) {
  return (
    <button
      type="submit"
      formAction={formAction}
      formNoValidate
      onClick={(event) => {
        const confirmed = window.confirm(
          "Yakin ingin menghapus jadwal ini? Data yang dihapus tidak dapat dikembalikan.",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="flex items-center justify-center gap-2 border-2 border-black bg-[#FF9292] px-5 py-3 font-black hover:bg-red-300"
    >
      <Trash2 size={18} />
      Hapus Jadwal
    </button>
  );
}
