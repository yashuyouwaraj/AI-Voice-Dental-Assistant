import ActivityOverview from "@/components/dashboard/ActivityOverview";
import EmergencyTriageCard from "@/components/dashboard/EmergencyTriageCard";
import MainActions from "@/components/dashboard/MainActions";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import Navbar from "@/components/Navbar";
import { featureFlags } from "@/lib/feature-flags";

export const dynamic = "force-dynamic";

function DashboardPage() {
  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <WelcomeSection />
        <MainActions />
        <ActivityOverview />
        {featureFlags.triageEnabled ? (
          <div className="mt-6">
            <EmergencyTriageCard />
          </div>
        ) : null}
      </div>
    </>
  );
}

export default DashboardPage;
