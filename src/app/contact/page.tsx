import { ArrowLeftIcon, MailIcon, PhoneIcon, SendIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ContactPage() {
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
          <div className="rounded-3xl border bg-card p-7 shadow-lg animate-in fade-in slide-in-from-left-3 duration-500">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Contact DentWise
            </h1>
            <p className="text-muted-foreground mb-6 text-lg">
              Partnerships, product feedback, enterprise questions, or patient
              support.
            </p>

            <div className="space-y-3">
              <div className="rounded-xl border bg-background p-4 flex items-center gap-3">
                <MailIcon className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">General</p>
                  <p className="font-medium">contact@dentwise.com</p>
                </div>
              </div>
              <div className="rounded-xl border bg-background p-4 flex items-center gap-3">
                <SendIcon className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Support</p>
                  <p className="font-medium">support@dentwise.com</p>
                </div>
              </div>
              <div className="rounded-xl border bg-background p-4 flex items-center gap-3">
                <PhoneIcon className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">+1 (555) 010-2400</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-lg animate-in fade-in slide-in-from-right-3 duration-500">
            <Image
              src="/HappyEating.png"
              alt="Contact DentWise"
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
