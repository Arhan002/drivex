
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { label: "Overview", href: "/dashboard", icon: "▦" },
  { label: "Lead Inbox", href: "/dashboard/leads", icon: "☷" },
  { label: "Follow-ups", href: "/dashboard/follow-ups", icon: "◷" },
  { label: "New Cars", href: "/cars", icon: "🚘" },
  { label: "Used Cars", href: "/used-cars", icon: "🚙" },
  { label: "Test Drives", href: "/book-test-drive", icon: "▣" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    if (href === "/cars") {
      return pathname === "/cars" || pathname.startsWith("/cars/");
    }
    if (href === "/used-cars") {
      return pathname === "/used-cars" || pathname.startsWith("/used-cars/");
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Mobile top navigation */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[#17191f] px-5 text-white lg:hidden">
        <Link href="/dashboard" className="text-2xl font-extrabold tracking-tight">
          Drive<span className="text-orange-500">X</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-xl hover:bg-white/10"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </header>

      {/* Mobile navigation panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 h-full w-full"
          />

          <aside className="relative h-full w-[280px] max-w-[85vw] bg-[#17191f] px-5 py-6 text-white shadow-2xl">
            <div className="mb-9 text-3xl font-extrabold">
              Drive<span className="text-orange-500">X</span>
            </div>

            <NavigationLinks
              pathname={pathname}
              isActive={isActive}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#17191f] text-white lg:flex">
        <div className="flex h-20 items-center border-b border-white/10 px-7">
          <Link href="/dashboard" className="text-3xl font-extrabold tracking-tight">
            Drive<span className="text-orange-500">X</span>
          </Link>
        </div>

        <div className="px-5 py-7">
          <p className="mb-5 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Workspace
          </p>

          <NavigationLinks
            pathname={pathname}
            isActive={isActive}
          />
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
            <p className="text-xs text-slate-400">DriveX Dealership</p>
            <p className="mt-1 text-sm font-semibold">Lucknow, India</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              CRM Workspace
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function NavigationLinks({
  isActive,
  onNavigate,
}: {
  pathname: string;
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2">
      {navigation.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition duration-200 ${
              active
                ? "bg-orange-600 text-white shadow-lg shadow-orange-950/30"
                : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-lg ${
              active ? "bg-white/15" : "bg-white/[0.04] group-hover:bg-white/10"
            }`}>
              {item.icon}
            </span>

            {item.label}

            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
