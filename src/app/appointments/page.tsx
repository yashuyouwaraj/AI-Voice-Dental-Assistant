"use client";

import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { AlertTriangleIcon } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppointmentConfirmationModal } from "@/components/appointments/AppointmentConfirmationModal";
import BookingConfirmationStep from "@/components/appointments/BookingConfirmationStep";
import DoctorSelectionStep from "@/components/appointments/DoctorSelectionStep";
import ProgressSteps from "@/components/appointments/ProgressSteps";
import TimeSelectionStep from "@/components/appointments/TimeSelectionStep";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useBookAppointment,
  useUserAppointments,
} from "@/hooks/use-appointments";
import { assessDentalTriage } from "@/lib/triage";
import { APPOINTMENT_TYPES } from "@/lib/utils";

type BookedAppointment = {
  doctorName: string;
  patientEmail: string;
  date: string;
  time: string;
};

function AppointmentsPageContent() {
  const searchParams = useSearchParams();
  const { isSignedIn } = useUser();

  const [selectedDentistId, setSelectedDentistId] = useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] =
    useState<BookedAppointment | null>(null);
  const [urgentSymptoms, setUrgentSymptoms] = useState(false);

  const bookAppointmentMutation = useBookAppointment();
  const { data: userAppointments = [] } = useUserAppointments();

  useEffect(() => {
    const action = searchParams.get("email_action");
    if (action === "confirmed") {
      toast.success("Appointment confirmed from email.");
    }
    if (action === "reschedule") {
      toast.info("Reschedule mode: update details and confirm booking.");
      const doctorId = searchParams.get("doctorId");
      const date = searchParams.get("date");
      const time = searchParams.get("time");
      if (doctorId) setSelectedDentistId(doctorId);
      if (date) setSelectedDate(date);
      if (time) setSelectedTime(time);
      setCurrentStep(2);
    }
  }, [searchParams]);

  const triageResult = useMemo(
    () =>
      assessDentalTriage({
        severeSwelling: urgentSymptoms,
        fever: urgentSymptoms,
        uncontrolledBleeding: false,
        traumaToFaceOrTooth: false,
        severePain: urgentSymptoms,
        painMoreThan48Hours: urgentSymptoms,
        troubleOpeningMouth: false,
        badTasteOrPus: false,
      }),
    [urgentSymptoms],
  );

  const handleSelectDentist = (dentistId: string) => {
    setSelectedDentistId(dentistId);
    setSelectedDate("");
    setSelectedTime("");
    setSelectedType("");
  };

  const handleBookAppointment = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to book an appointment.");
      return;
    }

    if (!selectedDentistId || !selectedDate || !selectedTime) {
      toast.error("Please fill in all required fields");
      return;
    }

    const appointmentType = APPOINTMENT_TYPES.find(
      (t) => t.id === selectedType,
    );

    bookAppointmentMutation.mutate(
      {
        doctorId: selectedDentistId,
        date: selectedDate,
        time: selectedTime,
        reason: urgentSymptoms
          ? `Urgent: ${appointmentType?.name || "Consultation"}`
          : appointmentType?.name,
      },
      {
        onSuccess: async (appointment) => {
          setBookedAppointment(appointment);

          try {
            const emailResponse = await fetch("/api/send-appointment-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                appointmentId: appointment.id,
                userEmail: appointment.patientEmail,
                doctorName: appointment.doctorName,
                appointmentDate: format(
                  new Date(appointment.date),
                  "EEEE, MMMM d, yyyy",
                ),
                appointmentTime: appointment.time,
                appointmentType: appointmentType?.name,
                duration: appointmentType?.duration,
                price: appointmentType?.price,
              }),
            });

            if (!emailResponse.ok) {
              const errorBody = await emailResponse.json().catch(() => ({}));
              console.warn(
                "Confirmation email not sent:",
                errorBody?.providerError ||
                  errorBody?.error ||
                  emailResponse.statusText,
              );
              toast.error(
                `Appointment booked, but email failed: ${errorBody?.providerError || errorBody?.error || emailResponse.statusText}`,
              );
            }
          } catch (error) {
            console.error("Error sending confirmation email:", error);
          }

          setShowConfirmationModal(true);
          setSelectedDentistId(null);
          setSelectedDate("");
          setSelectedTime("");
          setSelectedType("");
          setCurrentStep(1);
          setUrgentSymptoms(false);
        },
        onError: (error) =>
          toast.error(`Failed to book appointment: ${error.message}`),
      },
    );
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
          <p className="text-muted-foreground">
            Find and book with verified dentists in your area
          </p>

          <div className="mt-4 p-3 rounded-lg border bg-muted/20 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Urgency-Based Booking</p>
              <p className="text-xs text-muted-foreground">
                Enable this if your symptoms are urgent to prioritize earliest
                slots.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {triageResult.level !== "ROUTINE" ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangleIcon className="size-3" />
                  {triageResult.level}
                </Badge>
              ) : null}
              <Button
                size="sm"
                variant={urgentSymptoms ? "default" : "outline"}
                onClick={() => setUrgentSymptoms((v) => !v)}
              >
                {urgentSymptoms ? "Urgency ON" : "Mark Urgent"}
              </Button>
            </div>
          </div>

          <ProgressSteps currentStep={currentStep} />

          {currentStep === 1 && (
            <DoctorSelectionStep
              selectedDentistId={selectedDentistId}
              onContinue={() => setCurrentStep(2)}
              onSelectDentist={handleSelectDentist}
            />
          )}

          {currentStep === 2 && selectedDentistId && (
            <TimeSelectionStep
              selectedDentistId={selectedDentistId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedType={selectedType}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
              onTypeChange={setSelectedType}
            />
          )}

          {currentStep === 3 && selectedDentistId && (
            <BookingConfirmationStep
              selectedDentistId={selectedDentistId}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedType={selectedType}
              isBooking={bookAppointmentMutation.isPending}
              onBack={() => setCurrentStep(2)}
              onModify={() => setCurrentStep(2)}
              onConfirm={handleBookAppointment}
            />
          )}
        </div>
      </div>

      {userAppointments.length > 0 && (
        <div className="mb-8 max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold mb-4">
            Your Upcoming Appointments
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-card border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Image
                      src={appointment.doctorImageUrl || "/logo.png"}
                      alt={appointment.doctorName}
                      width={40}
                      height={40}
                      className="size-10 rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {appointment.doctorName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {appointment.reason}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    {format(new Date(appointment.date), "MMM d, yyyy")}
                  </p>
                  <p className="text-muted-foreground">{appointment.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookedAppointment && (
        <AppointmentConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          appointmentDetails={{
            doctorName: bookedAppointment.doctorName,
            appointmentDate: format(
              new Date(bookedAppointment.date),
              "EEEE, MMMM d, yyyy",
            ),
            appointmentTime: bookedAppointment.time,
            userEmail: bookedAppointment.patientEmail,
          }}
        />
      )}
    </>
  );
}

function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          Loading appointments...
        </div>
      }
    >
      <AppointmentsPageContent />
    </Suspense>
  );
}

export default AppointmentsPage;
