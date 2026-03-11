import { ArrowLeftIcon, FileCheck2Icon, LockKeyholeIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PrivacyPage() {
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
          <div className="rounded-3xl border bg-card p-7 shadow-lg animate-in fade-in slide-in-from-left-3 duration-500 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg">
              DentWise collects only what is needed to operate appointments,
              reminders, and care workflows.
            </p>
            <div className="rounded-xl border bg-background p-4">
              <p className="font-semibold flex items-center gap-2">
                <FileCheck2Icon className="size-4 text-primary" /> What we store
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Account identity, appointments, reminder events, and care-plan
                activity.
              </p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="font-semibold flex items-center gap-2">
                <LockKeyholeIcon className="size-4 text-primary" /> Your rights
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Request data export or deletion via privacy@dentwise.com.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-lg animate-in fade-in slide-in-from-right-3 duration-500">
            <Image
              src="/ToothCare.png"
              alt="Privacy and care"
              width={520}
              height={520}
              className="w-full h-auto object-contain"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
