import { describe, it, expect } from "vitest";
import { clampOnboardingStep, nextStepAfterAdvance } from "./onboarding";

describe("onboarding helpers", () => {
  it("clamps step to 0..4", () => {
    expect(clampOnboardingStep(-1)).toBe(0);
    expect(clampOnboardingStep(0)).toBe(0);
    expect(clampOnboardingStep(2.7)).toBe(2);
    expect(clampOnboardingStep(4)).toBe(4);
    expect(clampOnboardingStep(99)).toBe(4);
  });

  it("advances step until 4", () => {
    expect(nextStepAfterAdvance(0)).toBe(1);
    expect(nextStepAfterAdvance(3)).toBe(4);
    expect(nextStepAfterAdvance(4)).toBe(4);
  });
});
