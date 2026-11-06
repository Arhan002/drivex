
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/LogoutButton";

const baseNavigation = [
  { label: "Overview", href: "/dashboard", icon: "▦" },
  { label: "Lead Inbox", href: "/dashboard/leads", icon: "☷" },
  { label: "Follow-ups", href: "/dashboard/follow-ups", icon: "◷" },
  { label: "New Cars", href: "/cars?from=dashboard", icon: "🚘" },
  { label: "Used Cars", href: "/used-cars?from=dashboard", icon: "🚙" },
  { label: "Test Drives", href: "/book-test-drive?from=dashboard", icon: "▣" },
];

export default function DashboardSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [showroomName, setShowroomName] = useState<string | null>(null);

  useEffect(() => {
  async function loadRole() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, showroom_id")
      .eq("id", user.id)
      .single();

    setRole(profile?.role ?? null);

    if (profile?.showroom_id) {
      const { data: showroom } = await supabase
        .from("showrooms")
        .select("name")
        .eq("id", profile.showroom_id)
        .single();

      setShowroomName(showroom?.name ?? null);
    }
  }

  loadRole();
}, []);

  

  const navigation =
    role === "admin"
      ? [
          ...baseNavigation,
          {
            label: "Consultants",
            href: "/dashboard/consultants",
            icon: "👥",
          },
        ]
      : baseNavigation;

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
        <Link
          href="/dashboard"
          className="text-2xl font-extrabold tracking-tight"
        >
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
        <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 h-full w-full"
          />

          <aside className="relative flex h-dvh w-[280px] max-w-[85vw] flex-col overflow-hidden bg-[#17191f] px-5 py-6 text-white shadow-2xl">
            <div className="mb-7 shrink-0 text-3xl font-extrabold">
              Drive<span className="text-orange-500">X</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <NavigationLinks
                navigation={navigation}
                isActive={isActive}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>

            <div className="mt-4 shrink-0 border-t border-white/10 pt-5">
              <LogoutButton />
            </div>
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden h-dvh flex-col overflow-hidden bg-[#17191f] text-white transition-all duration-300 lg:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo and collapse button */}
        <div
          className={`flex h-20 shrink-0 items-center border-b border-white/10 ${
            collapsed ? "justify-center px-2" : "justify-between px-7"
          }`}
        >
          {!collapsed && (
            <Link
              href="/dashboard"
              className="text-3xl font-extrabold tracking-tight"
            >
              Drive<span className="text-orange-500">X</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-lg p-2 text-white hover:bg-white/10"
          >
            {collapsed ? "☰" : "←"}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-5 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>
          )}

          <NavigationLinks
            navigation={navigation}
            isActive={isActive}
            collapsed={collapsed}
          />
        </div>

        {/* Bottom section */}
        <div
          className={`shrink-0 border-t border-white/10 bg-[#17191f] ${
            collapsed ? "flex flex-col items-center gap-3 p-3" : "p-5"
          }`}
        >
          {!collapsed && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
              <p className="text-xs text-slate-400">Assigned Showroom</p>
<p className="mt-1 text-sm font-semibold">
  {showroomName ?? (role === "admin" ? "Lucknow, India" : "Showroom not assigned")}
</p>

              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                CRM Workspace
              </div>
            </div>
          )}

          <div
            title={collapsed ? "Logout" : undefined}
            className={collapsed ? "w-full overflow-hidden" : "mt-4"}
          >
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}

function NavigationLinks({
  navigation,
  isActive,
  onNavigate,
  collapsed = false,
}: {
  navigation: {
    label: string;
    href: string;
    icon: string;
  }[];
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  return (
    <nav className="space-y-1.5">
      {navigation.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={`group flex items-center rounded-xl py-3 text-sm font-medium transition duration-200 ${
              collapsed
                ? "justify-center px-2"
                : "gap-3 px-4"
            } ${
              active
                ? "bg-orange-600 text-white shadow-lg shadow-orange-950/30"
                : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg ${
                active
                  ? "bg-white/15"
                  : "bg-white/[0.04] group-hover:bg-white/10"
              }`}
            >
              {item.icon}
            </span>

            {!collapsed && item.label}

            {active && !collapsed && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
