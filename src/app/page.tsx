import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CTA from "@/components/landing/CTA";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import PricingSection from "@/components/landing/PricingSection";
import WhatToAsk from "@/components/landing/WhatToAsk";
import { isAdminUser } from "@/lib/access";
import { syncUser } from "@/lib/actions/users";

export default async function Home() {
  const user = await currentUser();

  await syncUser(); // ensure user is synced with database on each visit to home page

  //redirect auth user to appropriate page based on role
  if (user) {
    if (isAdminUser(user)) {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <WhatToAsk />
      <FAQ />
      <PricingSection />
      <CTA />
      <Footer />
    </div>
  );
}
