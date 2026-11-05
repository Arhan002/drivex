
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    // 1. Verify the logged-in user
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // 2. Check whether the user is an admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    // 3. Read and validate request data
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";
    const showroomId =
      typeof body.showroomId === "string" ? body.showroomId : "";

    if (!fullName || !email || !phone || !showroomId) {
      return NextResponse.json(
        { error: "Name, email, phone and showroom are required." },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit phone number." },
        { status: 400 }
      );
    }

    // 4. Verify that the showroom exists and is active
    const { data: showroom, error: showroomError } = await supabase
      .from("showrooms")
      .select("id")
      .eq("id", showroomId)
      .eq("is_active", true)
      .maybeSingle();

    if (showroomError || !showroom) {
      return NextResponse.json(
        { error: "Invalid or inactive showroom." },
        { status: 400 }
      );
    }

    // 5. Create the Supabase Admin client
    const adminClient = createAdminClient();

    // 6. Send the consultant an email invitation
    const { data: invitation, error: invitationError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${
          process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        }/auth/callback`,
        data: {
          full_name: fullName,
          phone,
        },
      });

    if (invitationError || !invitation.user) {
      return NextResponse.json(
        {
          error: invitationError?.message || "Unable to send invitation.",
        },
        { status: 400 }
      );
    }

    // 7. Create the consultant's profile
    const { error: insertError } = await adminClient
      .from("profiles")
      .insert({
        id: invitation.user.id,
        full_name: fullName,
        phone,
        role: "consultant",
        showroom_id: showroomId,
      });

    // 8. Roll back Auth account if profile creation fails
    if (insertError) {
      await adminClient.auth.admin.deleteUser(invitation.user.id);

      return NextResponse.json(
        {
          error:
            "Invitation was created, but profile creation failed. Please retry.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Consultant invitation sent successfully.",
        consultant: {
          id: invitation.user.id,
          fullName,
          email,
          phone,
          showroomId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Consultant creation error:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
