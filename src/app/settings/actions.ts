"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileSettings(data: {
  isNetworkingMode?: boolean;
  linkedinUrl?: string;
  twitterUrl?: string;
  company?: string;
  industry?: string;
  bio?: string;
  occupation?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...data,
      },
    });
    revalidatePath(`/profile/${user.id}`);
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
