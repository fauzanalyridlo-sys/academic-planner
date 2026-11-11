"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CheckSquare,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  NotebookPen,
  Settings,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { label: "Notes", href: "/dashboard/notes", icon: NotebookPen },
  { label: "Documents", href: "#", icon: FileText },
  {
    label: "TA Progress",
    href: "/dashboard/ta-progress",
    icon: GraduationCap,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
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

          const isActive =
            item.href === "/dashboard"
              ? pathname === item.href
              : item.href !== "#" &&
                (pathname === item.href ||
                  pathname.startsWith(`${item.href}/`));

          const isNavigable = item.href !== "#";

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-disabled={!isNavigable}
              tabIndex={isNavigable ? undefined : -1}
              className={`flex items-center gap-3 border-2 px-4 py-3 text-sm font-bold transition-all ${
                isActive
                  ? "translate-x-1 border-black bg-[#FFE14D] shadow-[3px_3px_0px_#000]"
                  : isNavigable
                    ? "border-transparent hover:border-black hover:bg-[#83D8FF]"
                    : "cursor-default border-transparent"
              }`}
            >
              <Icon size={18} strokeWidth={2.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-8">
        <div className="flex items-center gap-3 border-2 border-transparent px-4 py-3 text-sm font-bold">
          <Settings size={18} />
          <span>Settings</span>
        </div>

        <div className="flex items-center gap-3 border-2 border-transparent px-4 py-3 text-sm font-bold">
          <LogOut size={18} />
          <span>Sign out</span>
        </div>
      </div>
    </aside>
  );
}