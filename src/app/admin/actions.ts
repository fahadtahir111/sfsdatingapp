"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminRole, getAdminUser } from "@/lib/admin";

export async function toggleUserSuspension(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return;

  const userId = String(formData.get("userId") || "");
  const nextState = String(formData.get("nextState") || "") === "true";
  if (!userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: nextState },
  });

  revalidatePath("/admin");
}

export async function deletePostCommentAdmin(formData: FormData) {
  const role = await getAdminRole();
  if (!role || (role !== "moderator" && role !== "superadmin")) return;

  const commentId = String(formData.get("commentId") || "");
  if (!commentId) return;

  await prisma.postComment.delete({ where: { id: commentId } });
  revalidatePath("/admin");
}

export async function deleteReelCommentAdmin(formData: FormData) {
  const role = await getAdminRole();
  if (!role || (role !== "moderator" && role !== "superadmin")) return;

  const commentId = String(formData.get("commentId") || "");
  if (!commentId) return;

  await prisma.reelComment.delete({ where: { id: commentId } });
  revalidatePath("/admin");
}

