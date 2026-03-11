import { NextResponse } from "next/server";
import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import { getAppointmentActionLinksForEmail } from "@/lib/actions/appointments";
import resend from "@/lib/resend";

function getProviderErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return String(error);
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error: "Email service is not configured: RESEND_API_KEY is missing.",
        },
        { status: 500 },
      );
    }

    const body = await request.json();

    const {
      userEmail,
      doctorName,
      appointmentDate,
      appointmentTime,
      appointmentType,
      duration,
      price,
      appointmentId,
    } = body;

    // validate required fields
    if (!userEmail || !doctorName || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // send the email
    // do not use this in prod, only for testing purposes
    let confirmUrl: string | undefined;
    let rescheduleUrl: string | undefined;
    if (appointmentId) {
      try {
        const links = await getAppointmentActionLinksForEmail(appointmentId);
        const actionLinks = links as
          | { confirmUrl?: string; rescheduleUrl?: string }
          | undefined;
        confirmUrl = actionLinks?.confirmUrl;
        rescheduleUrl = actionLinks?.rescheduleUrl;
      } catch (linkError) {
        // Keep email delivery working even if action-link token storage fails.
        console.error("Failed generating appointment action links:", linkError);
      }
    }

    const fromEmail =
      process.env.EMAIL_FROM ||
      (process.env.NODE_ENV === "production"
        ? "DentWise <no-reply@dentwise.com>"
        : "DentWise <no-reply@resend.dev>");

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [userEmail],
      subject: "Appointment Confirmation - DentWise",
      react: AppointmentConfirmationEmail({
        doctorName,
        appointmentDate,
        appointmentTime,
        appointmentType,
        duration,
        price,
        confirmUrl,
        rescheduleUrl,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        {
          error: "Failed to send email",
          providerError: getProviderErrorMessage(error),
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Email sent successfully", emailId: data?.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email sending error:", error);
    const errorMessage = getProviderErrorMessage(error);
    return NextResponse.json(
      {
        error: "Internal server error",
        ...(process.env.NODE_ENV !== "production"
          ? { details: errorMessage }
          : {}),
      },
      { status: 500 },
    );
  }
}
