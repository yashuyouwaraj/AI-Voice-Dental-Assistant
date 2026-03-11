"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return;
    const primaryEmail = user.emailAddresses[0]?.emailAddress;
    if (!primaryEmail) return;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    if (existingUser) return;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: primaryEmail,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser server action", error);
  }
}

export async function getCurrentDbUserOrThrow() {
  const user = await currentUser();
  if (!user) throw new Error("You must be authenticated");

  const primaryEmail = user.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) throw new Error("No primary email found for current user");

  const existingByClerkId = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
  if (existingByClerkId) {
    try {
      return await prisma.user.update({
        where: { id: existingByClerkId.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: primaryEmail,
        },
      });
    } catch (error) {
      // If email is currently owned by another row, keep the linked user record and continue.
      console.error(
        "Failed updating user email from Clerk profile, falling back:",
        error,
      );
      return prisma.user.update({
        where: { id: existingByClerkId.id },
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    }
  }

  const existingByEmail = await prisma.user.findUnique({
    where: { email: primaryEmail },
  });
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }

  return prisma.user.create({
    data: {
      clerkId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: primaryEmail,
    },
  });
}
