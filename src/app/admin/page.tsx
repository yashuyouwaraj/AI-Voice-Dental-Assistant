import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import AdminDashboardClient from './AdminDashboardClient'

async function page() {
    const user = await currentUser()

    //user is not logged in
    if(!user) redirect("/")
    
    const adminEmail = process.env.ADMIN_EMAIL
    const userEmail = user.emailAddresses[0]?.emailAddress

    //user is not admin
    if(!adminEmail || userEmail !== adminEmail) redirect("/dashboard")
  return (
    <div>
        <AdminDashboardClient />
    </div>
  )
}

export default page