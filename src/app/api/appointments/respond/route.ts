import { NextResponse } from "next/server";
import {
  consumeAppointmentActionToken,
  createNotification,
} from "@/lib/engagement";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/appointments?token_error=missing", url.origin),
    );
  }

  const consumed = await consumeAppointmentActionToken(token);
  if (!consumed.ok) {
    return NextResponse.redirect(
      new URL(
        `/appointments?token_error=${encodeURIComponent(consumed.reason)}`,
        url.origin,
      ),
    );
  }

  const { record } = consumed;

  if (record.type === "CONFIRM") {
    await createNotification({
      userId: record.userId,
      title: "Appointment Confirmed from Email",
      message: "Thanks for confirming your appointment through email.",
      type: "APPOINTMENT",
    });
    return NextResponse.redirect(
      new URL("/appointments?email_action=confirmed", url.origin),
    );
  }

  return NextResponse.redirect(
    new URL(
      `/appointments?email_action=reschedule&doctorId=${record.appointment.doctor.id}&date=${record.appointment.date.toISOString().slice(0, 10)}&time=${record.appointment.time}`,
      url.origin,
    ),
  );
}
