"use server";

import { getCurrentUser } from "@/lib/auth";
import { ProfessionalService } from "@/lib/server/services/ProfessionalService";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getActiveBoardrooms() {
  try {
    return await ProfessionalService.getPriorityBoardrooms();
  } catch (error) {
    console.error("Error fetching boardrooms:", error);
    return [];
  }
}

export async function createBoardroom(title: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    const boardroom = await ProfessionalService.createBoardroom(user.id, title, description);
    revalidatePath("/boardroom");
    return { id: boardroom.id, title: boardroom.title };
  } catch {
    return { success: false, error: "Failed to create boardroom" };
  }
}

export async function endBoardroom(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  try {
    await prisma.boardroom.update({
      where: { id, hostId: user.id },
      data: { isLive: false },
    });
    revalidatePath("/boardroom");
  } catch (error) {
    console.error("Error ending boardroom:", error);
    throw new Error("Failed to end boardroom");
  }
}
