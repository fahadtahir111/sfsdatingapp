/* eslint-disable @typescript-eslint/no-explicit-any */
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
      membership: tier === "Elite" ? "Elite Concierge" : tier === "Signature" ? "Signature Member" : "SFS Member",
      tier,
      verificationStatus: dbUser.profile?.verificationStatus || "PENDING",
      incognito: dbUser.profile?.incognitoMode || false,
      pushEnabled: dbUser.profile?.pushEnabled ?? true,
      emailEnabled: dbUser.profile?.emailEnabled ?? false,
      matchesEnabled: dbUser.profile?.matchesEnabled ?? true,
      networkingGoals: dbUser.profile?.networkingGoals ? JSON.parse(dbUser.profile.networkingGoals) : [],
      tokens: dbUser.roseBalance || 0,
      professionalVerified: (dbUser.profile as any)?.professionalVerified || false,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

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
    return { success: true };
  } catch (error) {
    console.error("Error updating account:", error);
    throw new Error("Failed to update account");
  }
}

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
  const parseJsonArray = (raw?: string | null) => {
    if (!raw) return [] as string[];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        reels: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    });

    if (!user) return null;

    const photos = parseJsonArray(user.profile?.photos);

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    const tier = subscription?.tier || "Free";
    const reelsCount = user.reels.length;

    // Keep production resilient even if some newer tables are not migrated yet.
    let matches1Count = 0;
    let matches2Count = 0;
    let vouchesCount = 0;
    try {
      [matches1Count, matches2Count, vouchesCount] = await Promise.all([
        prisma.match.count({ where: { user1Id: userId } }),
        prisma.match.count({ where: { user2Id: userId } }),
        prisma.vouch.count({ where: { vouchForId: userId } }),
      ]);
    } catch (countErr) {
      console.warn("Public profile count fallback triggered:", countErr);
    }

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
      matchesCount: matches1Count + matches2Count,
      reelsCount,
      reels: user.reels,
      membership: tier === "Elite" ? "Elite Concierge" : tier === "Signature" ? "Signature Member" : "SFS Member",
      tier,
      verificationStatus: user.profile?.verificationStatus || "PENDING",
      networkingGoals: parseJsonArray(user.profile?.networkingGoals),
      vouchesCount,
      trustScore: user.profile?.trustScore || 50,
      professionalVerified: (user.profile as any)?.professionalVerified || false,
    };
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
}

export async function toggleGhostMode(status: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    await (prisma as any).profile.update({
      where: { userId: user.id },
      data: { incognitoMode: status }
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Ghost mode error:", error);
    return { success: false, error: "Failed to update status" };
  }
}
