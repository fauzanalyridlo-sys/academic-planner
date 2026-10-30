import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF9EB] px-5 py-10 text-black">
      <section className="w-full max-w-md border-[3px] border-black bg-white p-8 shadow-[8px_8px_0px_#000] sm:p-10">
        <div className="mb-8 inline-block border-[2px] border-black bg-[#FFE14D] px-3 py-2 text-sm font-black uppercase tracking-wider">
          Academic Command
        </div>

        <h1 className="text-4xl font-black leading-tight tracking-tight">
          Your semester.
          <br />
          Under control.
        </h1>

        <p className="mt-4 leading-relaxed text-gray-600">
          Satu tempat untuk mengatur tugas, jadwal kuliah, dokumen akademik,
          dan persiapan tugas akhir.
        </p>

        <div className="my-8 grid grid-cols-3 gap-3">
          <div className="border-2 border-black bg-[#B9A0FF] p-3 text-center">
            <span className="block text-xl font-black">01</span>
            <span className="text-xs font-bold">TASKS</span>
          </div>

          <div className="border-2 border-black bg-[#83D8FF] p-3 text-center">
            <span className="block text-xl font-black">02</span>
            <span className="text-xs font-bold">SCHEDULE</span>
          </div>

          <div className="border-2 border-black bg-[#B8F56A] p-3 text-center">
            <span className="block text-xl font-black">03</span>
            <span className="text-xs font-bold">THESIS</span>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 border-[3px] border-black bg-[#FFE14D] px-5 py-4 font-black shadow-[4px_4px_0px_#000] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="h-5 w-5"
            >
              <path
                fill="#4285F4"
                d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"
              />
              <path
                fill="#34A853"
                d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"
              />
              <path
                fill="#FBBC05"
                d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"
              />
              <path
                fill="#EA4335"
                d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.8 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Personal workspace · Built for your academic journey
        </p>
      </section>
    </main>
  );
}
