import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import SessionActivity from "@/components/session-activity";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SessionActivity />

      <div className="min-h-screen bg-[#FFF9EB] text-black">
        <div className="mx-auto flex min-h-screen max-w-[1600px]">
          <DashboardSidebar />

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </>
  );
}