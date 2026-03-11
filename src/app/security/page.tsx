import {
  ArrowLeftIcon,
  LockIcon,
  ScanLineIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SecurityPage() {
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
          <div className="space-y-4 animate-in fade-in slide-in-from-left-3 duration-500">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Security Center
            </h1>
            <p className="text-muted-foreground text-lg">
              Security is integrated into access control, API operations, and
              reminder workflows.
            </p>
            <div className="grid gap-3">
              <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
                <ShieldCheckIcon className="size-5 text-primary mt-0.5" />
                <p className="text-sm">
                  Role-based protection for admin operations.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
                <LockIcon className="size-5 text-primary mt-0.5" />
                <p className="text-sm">
                  Secret-validated webhook, reminder, and cron endpoints.
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
                <ScanLineIcon className="size-5 text-primary mt-0.5" />
                <p className="text-sm">
                  Server-side checks for booking and reminder state transitions.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Report issues: security@dentwise.com
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-lg animate-in fade-in slide-in-from-right-3 duration-500">
            <Image
              src="/Thumbs.png"
              alt="Security confidence"
              width={460}
              height={460}
              className="w-full h-auto object-contain"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
