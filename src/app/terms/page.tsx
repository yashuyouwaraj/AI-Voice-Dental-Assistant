import { ArrowLeftIcon, GavelIcon, ScaleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const terms = [
  "DentWise provides guidance and booking support, not licensed diagnosis.",
  "Users are responsible for accurate information in appointment requests.",
  "Features and service policies may evolve over time.",
  "Misuse of platform services may lead to access restrictions.",
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-6 py-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeftIcon className="size-4" /> Back to Home
        </Link>

        <section className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="rounded-3xl border bg-card p-7 shadow-lg animate-in fade-in slide-in-from-left-3 duration-500">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center gap-2">
              <GavelIcon className="size-8 text-primary" /> Terms of Service
            </h1>
            <div className="space-y-3">
              {terms.map((term, idx) => (
                <div
                  key={term}
                  className="rounded-xl border bg-background p-4 text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  {term}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-lg animate-in fade-in slide-in-from-right-3 duration-500">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <ScaleIcon className="size-3" /> Compliance and legal clarity
            </div>
            <Image
              src="/Operation.png"
              alt="Terms and compliance"
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
