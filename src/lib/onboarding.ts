/**
 * Pure helpers for identity onboarding steps (verify flow).
 * Kept separate from server actions for easy unit testing.
 */

export const ONBOARDING_STEP_MIN = 1;
export const ONBOARDING_STEP_MAX_SUBMITTED = 4;

export type OnboardingApiResult =
  | {
      success: true;
      status: string;
      step: number;
      nextStep: number | null;
      verificationStatus: string;
    }
  | {
      success: false;
      errorCode: string;
      message: string;
      step?: number;
    };

export function clampOnboardingStep(step: number): number {
  if (!Number.isFinite(step)) return 0;
  return Math.max(0, Math.min(4, Math.floor(step)));
}

export function nextStepAfterAdvance(current: number): number {
  const c = clampOnboardingStep(current);
  if (c >= 4) return 4;
  return c + 1;
}
