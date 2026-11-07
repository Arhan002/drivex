
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
      model: {
        name: string;
      } | null;
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

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const styles =
    normalized === "completed" || normalized === "converted"
      ? "bg-green-100 text-green-700"
      : normalized === "cancelled" || normalized === "lost"
        ? "bg-red-100 text-red-700"
        : normalized === "new"
          ? "bg-blue-100 text-blue-700"
          : "bg-orange-100 text-orange-700";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export default async function BuyerDashboardPage() {
  const supabase = await createClient();

  // Authenticate the user on the server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/buyer/login");
  }

  // Verify that this account is a Buyer.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role?.trim().toLowerCase() !== "buyer") {
    redirect("/buyer/login");
  }

  // Fetch only this Buyer's enquiries and bookings.
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

  return (
    <main className="min-h-screen bg-[#f8f8f6]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-2xl font-extrabold text-gray-900">
            Drive<span className="text-orange-600">X</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/book-test-drive?from=buyer"
              className="hidden rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 sm:inline-flex"
            >
              Book a Test Drive
            </Link>
            <Link
              href="/cars?from=buyer"
              className="hidden text-sm font-medium text-gray-600 hover:text-orange-600 sm:block"
            >
              Browse Cars
            </Link>

            <form action={handleSignOut}>
              <button
                type="submit"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10">
        {/* Welcome */}
        <section className="mb-9">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Buyer Portal
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome, {profile.full_name || "Buyer"}!
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your enquiries and test-drive bookings in one place.
          </p>
        </section>

        {/* Summary cards */}
        <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Total Enquiries</p>
            <p className="mt-3 text-4xl font-bold text-gray-900">
              {enquiries.length}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Your submitted car enquiries
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Test Drives</p>
            <p className="mt-3 text-4xl font-bold text-gray-900">
              {bookings.length}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Your test-drive bookings
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-sm font-medium text-gray-500">Account Status</p>
            <p className="mt-3 text-2xl font-bold text-green-600">Active</p>
            <p className="mt-2 text-sm text-gray-500">
              Your Buyer account is verified for access
            </p>
          </div>
        </section>

        {/* Enquiries */}
        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Enquiries</h2>
              <p className="mt-1 text-sm text-gray-500">
                Track the status of your car enquiries.
              </p>
            </div>
          </div>

          {enquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <p className="text-lg font-semibold text-gray-800">
                No enquiries yet
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Explore our cars and submit an enquiry to see it here.
              </p>
              <Link
                href="/cars"
                className="mt-5 inline-block rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Explore Cars
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enquiry) => (
                <article
                  key={enquiry.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {enquiry.interested_model?.name ||
                        (enquiry.source?.includes("used")
                          ? "Used Car Enquiry"
                          : "Car Enquiry")}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {enquiry.showroom?.name || "Showroom unavailable"}
                      {enquiry.showroom?.city
                        ? ` · ${enquiry.showroom.city}`
                        : ""}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      Submitted {formatDate(enquiry.created_at)}
                    </p>
                  </div>

                  <StatusBadge status={enquiry.status} />
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Test drives */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900">My Test Drives</h2>
          <p className="mt-1 mb-5 text-sm text-gray-500">
            View your scheduled test drives and booking status.
          </p>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50">
                <span className="text-2xl" aria-hidden="true">🚗</span>
              </div>
              <p className="mt-4 text-lg font-semibold text-gray-900">
                No test drives booked yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Ready to experience your favourite car? Schedule a test drive
                and track your appointment details right here.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/book-test-drive?from=buyer"
                  className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  + Book a Test Drive
                </Link>
                <Link
                  href="/cars?from=buyer"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-orange-500 hover:text-orange-600"
                >
                  Browse Vehicles
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <article
                  key={booking.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {booking.vehicle?.variant?.model?.name ||
                          "Test Drive"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {booking.vehicle?.variant?.variant_name ||
                          "Variant unavailable"}
                        {booking.vehicle?.registration_number
                          ? ` · ${booking.vehicle.registration_number}`
                          : ""}
                      </p>

                      <p className="mt-2 text-sm text-gray-500">
                        {booking.showroom?.name || "Showroom unavailable"}
                        {booking.showroom?.city
                          ? ` · ${booking.showroom.city}`
                          : ""}
                      </p>

                      <p className="mt-2 text-sm font-medium text-gray-700">
                        Scheduled: {formatDateTime(booking.scheduled_at)}
                      </p>
                    </div>

                    <StatusBadge status={booking.status} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Account details */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Account Details</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Full Name
              </p>
              <p className="mt-2 font-medium text-gray-800">
                {profile.full_name}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Email Address
              </p>
              <p className="mt-2 font-medium text-gray-800">{user.email}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Phone Number
              </p>
              <p className="mt-2 font-medium text-gray-800">
                {profile.phone || "Not provided"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Account Type
              </p>
              <p className="mt-2 font-medium capitalize text-gray-800">
                {profile.role}
              </p>
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-gray-400">
          DriveX Buyer Portal · Your vehicle journey starts here.
        </footer>
      </div>
    </main>
  );
}
