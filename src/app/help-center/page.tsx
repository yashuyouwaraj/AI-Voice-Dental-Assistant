import { ArrowLeftIcon, BadgeCheckIcon, LifeBuoyIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const supportItems = [
  "Appointment booking support",
  "Reminder and email troubleshooting",
  "Voice assistant guidance",
  "Care-plan and timeline questions",
];

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeftIcon className="size-4" /> Back to Home
        </Link>

        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-in fade-in slide-in-from-left-3 duration-500">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-semibold text-primary">
              <LifeBuoyIcon className="size-3" /> SUPPORT
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Help Center
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Quick help from the DentWise team for booking, reminders, account
              access, and care tracking.
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {supportItems.map((item, idx) => (
                <div
                  key={item}
                  className="rounded-xl border bg-card p-4 text-sm font-medium shadow-sm animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Email:</span>{" "}
                support@dentwise.com
              </p>
              <p>
                <span className="font-semibold text-foreground">Hours:</span>{" "}
                Mon-Fri, 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-lg animate-in fade-in slide-in-from-right-3 duration-500">
            <Image
              src="/HoldingTooth.png"
              alt="DentWise support"
              width={560}
              height={560}
              className="w-full h-auto object-contain"
            />
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <BadgeCheckIcon className="size-3" /> Average reply time under 2
              hours
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
