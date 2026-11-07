
import { resend } from "@/lib/resend";

type BookingEmailDetails = {
  buyerName: string;
  email: string;
  vehicleName: string;
  showroomName: string;
  scheduledAt: string;
  bookingId: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}

function formatBookingDate(scheduledAt: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(scheduledAt));
}

function bookingDetailsHtml(details: BookingEmailDetails) {
  return `
    <div style="background:#f8f8f8;padding:20px;border-radius:10px;">
      <h3>Booking Details</h3>
      <p><strong>Booking ID:</strong> ${escapeHtml(details.bookingId)}</p>
      <p><strong>Vehicle:</strong> ${escapeHtml(details.vehicleName)}</p>
      <p><strong>Showroom:</strong> ${escapeHtml(details.showroomName)}</p>
      <p><strong>Date & Time:</strong> ${escapeHtml(formatBookingDate(details.scheduledAt))}</p>
    </div>
  `;
}

export async function sendTestDriveBookingEmail(
  details: BookingEmailDetails
) {
  return resend.emails.send({
    from: "DriveX <onboarding@resend.dev>",
    to: ["arhanlogan958@gmail.com"],
    subject: "Your DriveX Test Drive Booking is Received!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#222;">
        <h1 style="color:#f97316;">DriveX</h1>
        <h2>Booking Received!</h2>
        <p>Hi ${escapeHtml(details.buyerName)},</p>
        <p>Thank you for choosing DriveX! Your test-drive booking has been successfully received.</p>
        ${bookingDetailsHtml(details)}
        <p>Our team will contact you to confirm your appointment.</p>
        <p>Thank you,<br/>Team DriveX</p>
      </div>
    `,
  });
}

export async function sendTestDriveConfirmedEmail(
  details: BookingEmailDetails
) {
  return resend.emails.send({
    from: "DriveX <onboarding@resend.dev>",
    to: ["arhanlogan958@gmail.com"],
    subject: "Your DriveX Test Drive is Confirmed!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;color:#222;">
        <h1 style="color:#f97316;">DriveX</h1>
        <h2>Your Test Drive is Confirmed!</h2>
        <p>Hi ${escapeHtml(details.buyerName)},</p>
        <p>Great news! Your test-drive appointment has been confirmed by our team.</p>
        ${bookingDetailsHtml(details)}
        <p>We look forward to seeing you at our showroom!</p>
        <p>Thank you,<br/>Team DriveX</p>
      </div>
    `,
  });
}
