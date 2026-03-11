import { ArrowLeftIcon, CheckCircle2Icon, Clock3Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const services = [
  { name: "Appointments", status: "Operational", uptime: "99.98%" },
  { name: "Reminders", status: "Operational", uptime: "99.95%" },
  { name: "Voice Assistant", status: "Operational", uptime: "99.90%" },
  { name: "Email Pipeline", status: "Operational", uptime: "99.97%" },
];

export default function StatusPage() {
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
          <div className="space-y-5 animate-in fade-in slide-in-from-left-3 duration-500">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              System Status
            </h1>
            <p className="text-muted-foreground text-lg">
              Live health for core patient and operations services.
            </p>
            <div className="space-y-3">
              {services.map((service, idx) => (
                <div
                  key={service.name}
                  className="rounded-xl border bg-card p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 text-emerald-500" />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-600 font-medium">
                      {service.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {service.uptime} uptime
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-lg animate-in fade-in slide-in-from-right-3 duration-500">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Clock3Icon className="size-3" /> Last refreshed: just now
            </div>
            <Image
              src="/Xray.png"
              alt="Service status overview"
              width={560}
              height={560}
              className="w-full h-auto object-contain"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
