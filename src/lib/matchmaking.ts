/* eslint-disable @typescript-eslint/no-explicit-any */
export function calculateCompatibility(user1: any, user2: any) {
  let score = 0;
  
  // 1. Networking Goals (Tags)
  const goals1 = user1.profile?.networkingGoals ? JSON.parse(user1.profile.networkingGoals) : [];
  const goals2 = user2.profile?.networkingGoals ? JSON.parse(user2.profile.networkingGoals) : [];
  
  const commonGoals = goals1.filter((g: string) => goals2.includes(g));
  score += commonGoals.length * 15; // 15 points per shared goal
  
  // 2. Industry Alignment
  if (user1.profile?.industry && user2.profile?.industry) {
    if (user1.profile.industry.toLowerCase() === user2.profile.industry.toLowerCase()) {
      score += 25;
    }
  }
  
  // 3. Occupation Similarity
  if (user1.profile?.occupation && user2.profile?.occupation) {
    const occ1 = user1.profile.occupation.toLowerCase();
    const occ2 = user2.profile.occupation.toLowerCase();
    if (occ1.includes(occ2) || occ2.includes(occ1)) {
      score += 20;
    }
  }
  
  // 4. Bio Keyword Matching (Simple)
  const bioKeywords = ["founder", "creator", "investor", "engineer", "designer", "ceo", "cto"];
  bioKeywords.forEach(kw => {
    if (user1.profile?.bio?.toLowerCase().includes(kw) && user2.profile?.bio?.toLowerCase().includes(kw)) {
      score += 10;
    }
  });

  // Normalize to 0-100
  return Math.min(score + 40, 99); // Base 40 for "elite" community members
}
