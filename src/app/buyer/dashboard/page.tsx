import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Enquiry = {
  id: string;
  status: string;
  source: string | null;
  created_at: string | null;
  interested_model: {
    name: string;
    image_url: string | null;
  } | null;
  showroom: {
    name: string;
    city: string | null;
  } | null;
};

type Booking = {
  id: string;
  scheduled_at: string;
  status: string;
  created_at: string | null;
  vehicle: {
    registration_number: string | null;
    variant: {
      variant_name: string;
      model: { name: string } | null;
    } | null;
  } | null;
  showroom: {
    name: string;
    city: string | null;
  } | null;
};

function formatDate(value: string | null) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) return "Schedule unavailable";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Anything not in this map is shown as-is, capitalized
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Booked",
  lost: "Closed",
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function statusLabel(status: string) {
  const key = status.toLowerCase();
  if (STATUS_LABELS[key]) return STATUS_LABELS[key];

  const text = status.replaceAll("_", " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const ICON_PATHS = {
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  check: <path d="M5 12l4 4 10-10" />,
  car: (
    <>
      <path d="M5 16l1.5-5a2 2 0 0 1 1.9-1.4h7.2a2 2 0 0 1 1.9 1.4L19 16" />
      <path d="M3 16h18v3H3z" />
      <path d="M7 19v2M17 19v2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
} as const;

type IconName = keyof typeof ICON_PATHS;

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();

  let colors = "bg-amber-50 text-amber-700 ring-amber-200";

  if (key === "completed" || key === "converted" || key === "confirmed") {
    colors = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  } else if (key === "cancelled" || key === "lost") {
    colors = "bg-rose-50 text-rose-700 ring-rose-200";
  } else if (key === "new") {
    colors = "bg-blue-50 text-blue-700 ring-blue-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${colors}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {statusLabel(status)}
    </span>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "orange",
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  icon: IconName;
  tone?: "orange" | "emerald";
}) {
  const iconTone =
    tone === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600";
  const valueTone = tone === "emerald" ? "text-emerald-600" : "text-slate-900";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}>
          <Icon name={icon} />
        </span>
      </div>
      <p className={`mt-4 text-4xl font-bold tracking-tight ${valueTone}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-400">{hint}</p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text,
  children,
}: {
  icon: IconName;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        <Icon name={icon} className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{text}</p>
      {children && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>
      )}
    </div>
  );
}

function EnquiryCard({ enquiry }: { enquiry: Enquiry }) {
  const imageUrl = enquiry.interested_model?.image_url;

  const title =
    enquiry.interested_model?.name ||
    (enquiry.source?.toLowerCase().includes("used") ? "Used car enquiry" : "Car enquiry");

  return (
    <article className="flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="hidden w-36 shrink-0 bg-slate-100 sm:block"
        style={
          imageUrl
            ? {
                backgroundImage: `url("${imageUrl}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
        role="img"
        aria-label={imageUrl ? title : "No image available"}
      >
        {!imageUrl && (
          <div className="flex h-full min-h-36 items-center justify-center text-slate-300">
            <Icon name="car" className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
              Enquiry
            </p>
            <h3 className="mt-1 truncate text-lg font-bold text-slate-900">{title}</h3>
          </div>
          <StatusBadge status={enquiry.status} />
        </div>

        <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
          <Icon name="pin" className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {enquiry.showroom?.name || "Showroom unavailable"}
            {enquiry.showroom?.city ? `, ${enquiry.showroom.city}` : ""}
          </span>
        </p>

        <p className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <Icon name="calendar" className="h-4 w-4 shrink-0" />
          Sent on {formatDate(enquiry.created_at)}
        </p>
      </div>
    </article>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
            <Icon name="car" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
              Test drive
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-900">
              {booking.vehicle?.variant?.model?.name || "Test drive"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {booking.vehicle?.variant?.variant_name || "Variant unavailable"}
              {booking.vehicle?.registration_number
                ? ` · ${booking.vehicle.registration_number}`
                : ""}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Icon name="pin" className="h-4 w-4 shrink-0" />
              {booking.showroom?.name || "Showroom unavailable"}
              {booking.showroom?.city ? `, ${booking.showroom.city}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:items-end sm:border-0 sm:pt-0">
          <StatusBadge status={booking.status} />
          <div className="sm:text-right">
            <p className="text-xs text-slate-400">Scheduled for</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800 sm:justify-end">
              <Icon name="calendar" className="h-4 w-4 shrink-0 text-slate-400" />
              {formatDateTime(booking.scheduled_at)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default async function BuyerDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/buyer/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role?.trim().toLowerCase() !== "buyer") {
    redirect("/buyer/login");
  }

  const [enquiriesResult, bookingsResult] = await Promise.all([
    supabase
      .from("leads")
      .select(`
        id,
        status,
        source,
        created_at,
        interested_model:car_models!leads_interested_model_id_fkey (
          name,
          image_url
        ),
        showroom:showrooms!leads_showroom_id_fkey (
          name,
          city
        )
      `)
      .eq("buyer_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("test_drive_bookings")
      .select(`
        id,
        scheduled_at,
        status,
        created_at,
        vehicle:demo_vehicles!test_drive_bookings_demo_vehicle_id_fkey (
          registration_number,
          variant:car_variants!demo_vehicles_variant_id_fkey (
            variant_name,
            model:car_models!car_variants_model_id_fkey (
              name
            )
          )
        ),
        showroom:showrooms!test_drive_bookings_showroom_id_fkey (
          name,
          city
        )
      `)
      .eq("buyer_id", user.id)
      .order("scheduled_at", { ascending: false }),
  ]);

  if (enquiriesResult.error) {
    console.error("Buyer enquiries query error:", enquiriesResult.error);
  }

  if (bookingsResult.error) {
    console.error("Buyer bookings query error:", bookingsResult.error);
  }

  const enquiries = (enquiriesResult.data ?? []) as unknown as Enquiry[];
  const bookings = (bookingsResult.data ?? []) as unknown as Booking[];

  async function handleSignOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/buyer/login");
  }

  const firstName = profile.full_name?.trim().split(/\s+/)[0] || "there";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link
            href="/"
            className="rounded text-2xl font-black tracking-tight text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            DRIVE<span className="text-orange-600">X.</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <Link href="/cars?from=buyer" className="hover:text-orange-600">New cars</Link>
            <Link href="/used-cars?from=buyer" className="hover:text-orange-600">Used cars</Link>
            <Link href="/book-test-drive?from=buyer" className="hover:text-orange-600">Test drives</Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{profile.full_name || "Buyer"}</p>
              <p className="text-xs text-slate-400">Buyer account</p>
            </div>

            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Quick links"
          className="flex gap-2 overflow-x-auto border-t border-slate-100 px-5 py-3 text-sm font-medium md:hidden"
        >
          <Link href="/cars?from=buyer" className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-1.5 text-slate-700">New cars</Link>
          <Link href="/used-cars?from=buyer" className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-1.5 text-slate-700">Used cars</Link>
          <Link href="/book-test-drive?from=buyer" className="whitespace-nowrap rounded-full bg-slate-100 px-4 py-1.5 text-slate-700">Test drives</Link>
        </nav>
      </header>

      <div className="mx-auto max-w-6xl space-y-14 px-5 py-10">
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange-600/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold text-orange-400">Your DriveX account</p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Welcome back, {firstName}!
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              See all your car enquiries and test-drive bookings in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/cars?from=buyer"
                className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                Explore new cars
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
              <Link
                href="/book-test-drive?from=buyer"
                className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Book a test drive
              </Link>
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Your activity"
            description="A quick summary of your account."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total enquiries"
              value={enquiries.length}
              hint="Car enquiries you have sent"
              icon="mail"
            />
            <StatCard
              label="Test drives"
              value={bookings.length}
              hint="Your scheduled appointments"
              icon="calendar"
            />
            <StatCard
              label="Account status"
              value="Active"
              hint="Your account is verified"
              icon="check"
              tone="emerald"
            />
          </div>
        </section>

        <section>
          <SectionHeader
            title="My enquiries"
            description="Follow the progress of the cars you asked about."
            action={
              <Link
                href="/cars?from=buyer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                Browse cars
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            }
          />

          {enquiries.length === 0 ? (
            <EmptyState
              icon="mail"
              title="No enquiries yet"
              text="Found a car you like? Send an enquiry and it will show up here."
            >
              <Link
                href="/cars?from=buyer"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Explore cars
              </Link>
            </EmptyState>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {enquiries.map((enquiry) => (
                <EnquiryCard key={enquiry.id} enquiry={enquiry} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title="My test drives"
            description="Your upcoming and past test-drive appointments."
            action={
              <Link
                href="/book-test-drive?from=buyer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 hover:text-orange-800"
              >
                Book another
                <Icon name="arrow" className="h-4 w-4" />
              </Link>
            }
          />

          {bookings.length === 0 ? (
            <EmptyState
              icon="car"
              title="No test drives booked"
              text="Pick a car you like and book a test drive at a DriveX showroom near you."
            >
              <Link
                href="/book-test-drive?from=buyer"
                className="rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Book a test drive
              </Link>
              <Link
                href="/cars?from=buyer"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-700"
              >
                Browse cars
              </Link>
            </EmptyState>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeader
            title="Account details"
            description="The information we have saved for you."
          />

          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Full name", value: profile.full_name || "Not provided" },
              { label: "Email address", value: user.email || "Not provided" },
              { label: "Phone number", value: profile.phone || "Not provided" },
              { label: "Account type", value: profile.role || "Buyer" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <dt className="text-xs font-medium text-slate-400">{item.label}</dt>
                <dd className="mt-1.5 break-words text-base font-semibold text-slate-800">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 text-center sm:flex-row sm:text-left">
          <Link href="/" className="text-lg font-black tracking-tight text-slate-900">
            DRIVE<span className="text-orange-600">X.</span>
          </Link>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} DriveX. All rights reserved.
          </p>
          <Link href="/cars?from=buyer" className="text-xs font-semibold text-slate-500 hover:text-orange-600">
            Discover your next car →
          </Link>
        </footer>
      </div>
    </main>
  );
}