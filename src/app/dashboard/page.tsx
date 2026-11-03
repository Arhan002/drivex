
import Link from "next/link";

const stats = [
  {
    label: "Total Leads",
    value: "0",
    change: "All customer enquiries",
    icon: "👥",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "New Enquiries",
    value: "0",
    change: "Awaiting first contact",
    icon: "✨",
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "Contacted",
    value: "0",
    change: "Customers reached",
    icon: "📞",
    color: "bg-purple-50 text-purple-600",
  },
  {
    label: "Converted",
    value: "0",
    change: "Successful sales",
    icon: "🏆",
    color: "bg-green-50 text-green-600",
  },
];

const navigation = [
  { label: "Overview", href: "/dashboard", icon: "▦" },
  { label: "Lead Inbox", href: "/dashboard/leads", icon: "☷" },
  { label: "New Cars", href: "/cars", icon: "🚘" },
  { label: "Used Cars", href: "/used-cars", icon: "🚙" },
  { label: "Test Drives", href: "/book-test-drive", icon: "🗓" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] text-gray-900">

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-[#17191f] text-white lg:flex">

        <div className="flex h-20 items-center border-b border-white/10 px-7">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Drive<span className="text-orange-500">X</span>
          </h1>
        </div>

        <div className="px-5 py-7">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Workspace
          </p>

          <nav className="space-y-2">
            {navigation.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  index === 0
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-950/30"
                    : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-5">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-400">DriveX Dealership</p>
            <p className="mt-1 text-sm font-semibold">Lucknow, India</p>
            <p className="mt-3 text-xs text-green-400">
              ● System operational
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">

        {/* Top Navigation */}
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 px-5 backdrop-blur-md md:px-9">
          <div>
            <p className="text-xs text-gray-500">Workspace / Overview</p>
            <h2 className="mt-1 text-lg font-bold">Sales Dashboard</h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="hidden rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600 sm:block"
            >
              View Website ↗
            </Link>

            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                DC
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">DriveX Consultant</p>
                <p className="text-xs text-gray-500">Sales Team</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-5 md:p-9">

          {/* Welcome */}
          <section className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                DEALERSHIP OVERVIEW
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                Welcome back, Consultant!
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Here's what's happening with your customer enquiries.
              </p>
            </div>

            <Link
              href="/cars"
              className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-700"
            >
              + Explore Inventory
            </Link>
          </section>

          {/* KPI Cards */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </p>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${stat.color}`}>
                    {stat.icon}
                  </span>
                </div>

                <h3 className="mt-5 text-3xl font-bold tracking-tight">
                  {stat.value}
                </h3>

                <p className="mt-2 text-xs text-gray-500">
                  {stat.change}
                </p>
              </div>
            ))}
          </section>

          {/* Lower Dashboard */}
          <section className="mt-9 grid gap-6 xl:grid-cols-3">

            {/* Lead Activity */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Lead Activity</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Overview of your sales pipeline
                  </p>
                </div>
                <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600">
                  All time
                </span>
              </div>

              <div className="mt-8 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
                <span className="text-4xl">📊</span>
                <p className="mt-3 font-semibold text-gray-700">
                  Your sales activity will appear here
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Lead analytics will update as enquiries arrive.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-bold">Quick Actions</h2>
              <p className="mt-1 text-sm text-gray-500">
                Frequently used tools
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/dashboard/leads"
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div>
                    <p className="text-sm font-semibold">View Lead Inbox</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Manage customer enquiries
                    </p>
                  </div>
                  <span className="text-xl text-orange-600">→</span>
                </Link>

                <Link
                  href="/cars"
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div>
                    <p className="text-sm font-semibold">Browse New Cars</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Explore available inventory
                    </p>
                  </div>
                  <span className="text-xl text-orange-600">→</span>
                </Link>

                <Link
                  href="/used-cars"
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  <div>
                    <p className="text-sm font-semibold">Used Car Inventory</p>
                    <p className="mt-1 text-xs text-gray-500">
                      View pre-owned vehicles
                    </p>
                  </div>
                  <span className="text-xl text-orange-600">→</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Recent Leads */}
          <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-gray-100 p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">Recent Enquiries</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Latest customer enquiries received by DriveX
                </p>
              </div>

              <Link
                href="/dashboard/leads"
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                View all leads →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Interested In</th>
                    <th className="px-6 py-4">Showroom</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <p className="font-medium text-gray-700">
                        Lead records will appear here
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        Connect the live lead inbox to view customer data.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer className="py-8 text-center text-xs text-gray-400">
            © 2026 DriveX Dealership Management. All rights reserved.
          </footer>
        </main>
      </div>
    </div>
  );
}
