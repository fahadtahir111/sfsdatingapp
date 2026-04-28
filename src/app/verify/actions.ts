"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import {
  clampOnboardingStep,
  nextStepAfterAdvance,
  type OnboardingApiResult,
} from "@/lib/onboarding";

type OnboardingProfileShape = {
  verificationStatus: string | null;
  onboardingStep: number | null;
  onboardingStartedAt?: Date | null;
  onboardingCompletedAt?: Date | null;
};

type ProfileDelegateCompat = {
  findUnique: (args: unknown) => Promise<OnboardingProfileShape | null>;
  update: (args: unknown) => Promise<unknown>;
};

function profileCompat(client: typeof prisma | Prisma.TransactionClient): ProfileDelegateCompat {
  return client.profile as unknown as ProfileDelegateCompat;
}

function okPayload(
  step: number,
  verificationStatus: string,
  nextStep: number | null
): Extract<OnboardingApiResult, { success: true }> {
  return {
    success: true,
    status: "ok",
    step,
    nextStep,
    verificationStatus,
  };
}

function err(
  errorCode: string,
  message: string,
  step?: number
): Extract<OnboardingApiResult, { success: false }> {
  return { success: false, errorCode, message, ...(step !== undefined ? { step } : {}) };
}

/**
 * Load persisted onboarding + verification state for the verify wizard.
 */
export async function getOnboardingStatus(): Promise<OnboardingApiResult> {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) {
      return err("UNAUTHORIZED", "Please sign in to continue verification.");
    }

    const profile = await profileCompat(prisma).findUnique({
      where: { userId },
      select: {
        verificationStatus: true,
        onboardingStep: true,
        onboardingStartedAt: true,
        onboardingCompletedAt: true,
      },
    });

    if (!profile) {
      return err("NO_PROFILE", "Profile not found. Complete signup first.");
    }

    const step = clampOnboardingStep(profile.onboardingStep ?? 0);
    const vs = profile.verificationStatus ?? "PENDING";

    let nextStep: number | null = step;
    if (vs === "VERIFIED") nextStep = null;
    else if (step >= 4 && vs === "PENDING") nextStep = null;

    return {
      success: true,
      status: "ok",
      step,
      nextStep,
      verificationStatus: vs,
    };
  } catch (e) {
    console.error("getOnboardingStatus:", e);
    return err("SERVER_ERROR", "Could not load verification status.");
  }
}

/**
 * Begin the verification wizard (step 1).
 */
export async function startOnboarding(): Promise<OnboardingApiResult> {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return err("UNAUTHORIZED", "Please sign in.");

    const existing = await profileCompat(prisma).findUnique({
      where: { userId },
      select: { onboardingStep: true, verificationStatus: true, onboardingStartedAt: true },
    });

    const stepToSet = Math.max(1, clampOnboardingStep(existing?.onboardingStep ?? 0) || 1);

    await profileCompat(prisma).update({
      where: { userId },
      data: {
        onboardingStep: stepToSet,
        onboardingStartedAt: existing?.onboardingStartedAt ?? new Date(),
      },
    });

    const profile = await profileCompat(prisma).findUnique({
      where: { userId },
      select: { onboardingStep: true, verificationStatus: true },
    });

    const step = clampOnboardingStep(profile?.onboardingStep ?? 1);
    const vs = profile?.verificationStatus ?? "PENDING";
    revalidatePath("/verify");
    revalidatePath("/profile");

    return okPayload(step, vs, step < 4 ? step + 1 : null);
  } catch (e) {
    console.error("startOnboarding:", e);
    return err("SERVER_ERROR", "Could not start verification.");
  }
}

/**
 * Advance or set wizard step (1–4). Optional payload reserved for future ID URLs.
 */
/** Optional payload reserved for future ID/selfie URLs from client uploads. */
export async function saveOnboardingStep(step: number): Promise<OnboardingApiResult> {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return err("UNAUTHORIZED", "Please sign in.");

    const target = clampOnboardingStep(step);
    if (target < 1 || target > 4) {
      return err("INVALID_STEP", "Invalid verification step.", target);
    }

    await profileCompat(prisma).update({
      where: { userId },
      data: {
        onboardingStep: target,
        onboardingStartedAt: { set: new Date() },
      },
    });

    const profile = await profileCompat(prisma).findUnique({
      where: { userId },
      select: { verificationStatus: true, onboardingStep: true },
    });

    const s = clampOnboardingStep(profile?.onboardingStep ?? target);
    const vs = profile?.verificationStatus ?? "PENDING";
    const next = s >= 4 ? null : nextStepAfterAdvance(s);

    revalidatePath("/verify");
    return okPayload(s, vs, next);
  } catch (e) {
    console.error("saveOnboardingStep:", e);
    return err("SERVER_ERROR", "Could not save progress.");
  }
}

/**
 * Submit documents — sets verification PENDING, advances step to 4, upserts Verification row.
 */
export async function submitVerification(): Promise<OnboardingApiResult> {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return err("UNAUTHORIZED", "Please sign in.");

    await prisma.$transaction(async (tx) => {
      await profileCompat(tx).update({
        where: { userId },
        data: {
          verificationStatus: "PENDING",
          onboardingStep: 4,
          onboardingCompletedAt: new Date(),
          trustScore: { increment: 10 },
        },
      });

      await tx.verification.upsert({
        where: { userId },
        create: {
          userId,
          status: "PENDING",
        },
        update: {
          status: "PENDING",
        },
      });
    });

    revalidatePath("/profile");
    revalidatePath("/verify");

    const profile = await profileCompat(prisma).findUnique({
      where: { userId },
      select: { verificationStatus: true, onboardingStep: true },
    });

    return okPayload(
      clampOnboardingStep(profile?.onboardingStep ?? 4),
      profile?.verificationStatus ?? "PENDING",
      null
    );
  } catch (e) {
    console.error("submitVerification:", e);
    return err("SUBMIT_FAILED", "Submission failed. Try again.");
  }
}

/**
 * Mark onboarding wizard complete from client after step 4 UI (alias for consistency).
 */
export async function completeOnboarding(): Promise<OnboardingApiResult> {
  return submitVerification();
}

/**
 * Dev/demo only — instant verified. Gated by NODE_ENV in client.
 */
export async function simulateVerifyUser(): Promise<{ success: boolean; error?: string }> {
  if (process.env.NODE_ENV === "production") {
    return { success: false, error: "Not available" };
  }
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.$transaction(async (tx) => {
      await profileCompat(tx).update({
        where: { userId },
        data: {
          verificationStatus: "VERIFIED",
          trustScore: 100,
          onboardingStep: 4,
          onboardingCompletedAt: new Date(),
        },
      });
      await tx.verification.upsert({
        where: { userId },
        create: { userId, status: "VERIFIED" },
        update: { status: "VERIFIED" },
      });
    });

    revalidatePath("/profile");
    revalidatePath("/verify");
    return { success: true };
  } catch (e) {
    console.error("simulateVerifyUser:", e);
    return { success: false, error: "Failed" };
  }
}
