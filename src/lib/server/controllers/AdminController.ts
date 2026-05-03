import { UserRepository } from "../repositories/UserRepository";
import { MatchingService } from "../services/MatchingService";
import { NextResponse } from "next/server";

export class AdminController {
  /**
   * GET /api/admin/stats
   */
  public static async getStats() {
    // In a real controller, we'd check admin authorization first
    try {
      // Logic would go here
      return NextResponse.json({ success: true, message: "Stats fetched" });
    } catch {
      return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
  }

  /**
   * GET /api/admin/debug-match/:u1/:u2
   */
  public static async debugMatchScore(u1Id: string, u2Id: string) {
    const user1 = await UserRepository.getFullUser(u1Id);
    const user2 = await UserRepository.getFullUser(u2Id);

    if (!user1 || !user2) {
      return NextResponse.json({ error: "Users not found" }, { status: 404 });
    }

    const score = MatchingService.calculateScore(user1, user2);
    
    return NextResponse.json({
      score,
      analysis: {
        user1: user1.email,
        user2: user2.email,
        breakdown: "Weighted calculation based on similarity, proximity, activity, trust, and popularity."
      }
    });
  }
}
