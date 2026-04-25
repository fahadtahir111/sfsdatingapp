"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) {
      console.log("getProfile: No userId found");
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        reels: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
        stories: {
          orderBy: { createdAt: "desc" },
          where: { expiresAt: { gt: new Date() } },
          take: 10,
        },
        _count: {
          select: {
            matches1: true,
            matches2: true,
            reels: true,
            stories: true,
          },
        },
      },
    });

    if (!dbUser) return null;

    let photos: string[] = [];
    try {
      photos = JSON.parse(dbUser.profile?.photos || "[]");
    } catch { }

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const tier = subscription?.tier || "Free";

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      age: dbUser.profile?.age || null,
      occupation: dbUser.profile?.occupation || null,
      bio: dbUser.profile?.bio || "",
      photos:
        photos.length > 0
          ? photos
          : [
              `https://ui-avatars.com/api/?name=${encodeURIComponent(dbUser.name || "U")}&background=random&size=400`,
            ],
      matchesCount:
        ((dbUser._count as unknown) as { matches1: number; matches2: number }).matches1 + ((dbUser._count as unknown) as { matches1: number; matches2: number }).matches2,
      reelsCount: dbUser._count.reels,
      storiesCount: dbUser._count.stories,
      reels: dbUser.reels,
      stories: dbUser.stories,
      membership: tier === "Elite" ? "Elite Concierge" : tier === "Signature" ? "Signature Member" : "Apply for Elite",
      tier,
      verificationStatus: dbUser.profile?.verificationStatus || "PENDING",
      incognito: dbUser.profile?.incognitoMode || false,
      pushEnabled: dbUser.profile?.pushEnabled ?? true,
      emailEnabled: dbUser.profile?.emailEnabled ?? false,
      matchesEnabled: dbUser.profile?.matchesEnabled ?? true,
      networkingGoals: dbUser.profile?.networkingGoals ? JSON.parse(dbUser.profile.networkingGoals) : [],
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

/**
 * Update user profile details including bio and photos.
 */
export async function updateProfile(data: {
  name?: string;
  age?: number | null;
  occupation?: string;
  bio?: string;
  photos?: string[];
  networkingGoals?: string[];
}) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    const updateData: Record<string, string | number | null> = {};
    if (data.name !== undefined) updateData.name = data.name;

    const profileData: Record<string, string | number | null | boolean> = {};
    if (data.age !== undefined) profileData.age = data.age;
    if (data.occupation !== undefined) profileData.occupation = data.occupation;
    if (data.bio !== undefined) profileData.bio = data.bio;
    if (data.photos !== undefined)
      profileData.photos = JSON.stringify(data.photos);
    if (data.networkingGoals !== undefined)
      profileData.networkingGoals = JSON.stringify(data.networkingGoals);

    if (data.name !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          profile: {
            upsert: {
              create: {
                photos: (profileData.photos as string) ?? "[]",
                ...profileData,
              },
              update: profileData,
            },
          },
        },
      });
    } else {
      await prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          photos: (profileData.photos as string) ?? "[]",
          ...profileData,
        },
        update: profileData,
      });
    }

    revalidatePath("/profile");
    revalidatePath("/discover");
    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

/**
 * Update user account details.
 */
export async function updateAccount(data: {
  name: string;
  age?: number;
  occupation?: string;
}) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        profile: {
          upsert: {
            create: {
              age: data.age,
              occupation: data.occupation,
              photos: "[]",
            },
            update: {
              age: data.age,
              occupation: data.occupation,
            },
          },
        },
      },
    });

    revalidatePath("/profile");
    revalidatePath("/discover");
    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Failed to update account");
  }
}

/**
 * Update privacy settings (Incognito/Ghost mode).
 */
export async function updatePrivacy(incognito: boolean) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    await prisma.profile.update({
      where: { userId },
      data: { incognitoMode: incognito },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating privacy:", error);
    throw new Error("Failed to update privacy settings");
  }
}

/**
 * Update notification settings.
 */
export async function updateNotifications(data: {
  pushEnabled?: boolean;
  emailEnabled?: boolean;
  matchesEnabled?: boolean;
}) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    await prisma.profile.update({
      where: { userId },
      data: {
        ...data,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating notifications:", error);
    throw new Error("Failed to update notification settings");
  }
}



export async function getPublicProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        reels: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
        _count: {
          select: {
            matches1: true,
            matches2: true,
            reels: true,
          },
        },
      },
    });

    if (!user) return null;

    let photos: string[] = [];
    try {
      photos = JSON.parse(user.profile?.photos || "[]");
    } catch { }

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const tier = subscription?.tier || "Free";

    return {
      id: user.id,
      name: user.name,
      age: user.profile?.age || null,
      occupation: user.profile?.occupation || null,
      bio: user.profile?.bio || "",
      photos:
        photos.length > 0
          ? photos
          : [
               `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=random&size=400`,
            ],
      matchesCount: (user._count as { matches1: number; matches2: number }).matches1 + (user._count as { matches1: number; matches2: number }).matches2,
      reelsCount: user._count.reels,
      reels: user.reels,
      membership: tier === "Elite" ? "Elite Concierge" : tier === "Signature" ? "Signature Member" : "SFS Member",
      tier,
      verificationStatus: user.profile?.verificationStatus || "PENDING",
      networkingGoals: user.profile?.networkingGoals ? JSON.parse(user.profile.networkingGoals) : [],
    };
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}
