import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/access";
import AdminDashboardClient from "./AdminDashboardClient";

async function page() {
  const user = await currentUser();

  //user is not logged in
  if (!user) redirect("/");

  //user is not admin
  if (!isAdminUser(user)) redirect("/dashboard");
  return (
    <div>
      <AdminDashboardClient />
    </div>
  );
}

export default page;
