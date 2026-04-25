"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Fetch all upcoming events.
 * Includes RSVP status for the current user.
 */
export async function getEvents() {
  const user = await getCurrentUser();
  const userId = user?.id;

  const events = await prisma.event.findMany({
    where: {
      date: { gte: new Date() }
    },
    include: {
      rsvps: true,
      _count: { select: { rsvps: true } }
    },
    orderBy: { date: 'asc' }
  });

  return events.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    isEliteOnly: event.isEliteOnly,
    rsvpsCount: event._count.rsvps,
    isRSVPed: userId ? event.rsvps.some(r => r.userId === userId) : false,
    // Note: In a real app, you'd store image URLs in the DB. 
    // For this build, we use descriptive titles to select a premium placeholder if none exists.
    image: event.title.includes("Gala") 
      ? "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format" 
      : "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format"
  }));
}

/**
 * RSVP to an event.
 * Checks for elite status if required.
 */
export async function rsvpToEvent(eventId: string) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    // 1. Check event and requirements
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { rsvps: true }
    });

    if (!event) throw new Error("Event not found");

    // 2. Check Elite Requirement
    if (event.isEliteOnly) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscriptions: true }
      });
      
      const isElite = user?.subscriptions.some(s => s.tier === "Elite" && (!s.expiresAt || s.expiresAt > new Date()));
      if (!isElite) {
        return { success: false, error: "This mixer is reserved for Elite Concierge members." };
      }
    }

    // 3. Check if already RSVPed
    const existing = await prisma.eventRSVP.findFirst({
      where: { eventId, userId }
    });

    if (existing) {
      // Toggle RSVP off
      await prisma.eventRSVP.delete({ where: { id: existing.id } });
      revalidatePath("/events");
      return { success: true, action: "unrsvp" };
    }

    // 4. Create RSVP
    await prisma.eventRSVP.create({
      data: { eventId, userId }
    });

    revalidatePath("/events");
    return { success: true, action: "rsvp" };
    
  } catch (error) {
    console.error("Error in rsvpToEvent:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Get attendees for a specific event.
 */
export async function getEventAttendees(eventId: string) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return [];

    const rsvps = await prisma.eventRSVP.findMany({
      where: { eventId },
      include: {
        user: {
          include: { profile: true }
        }
      },
      take: 10 // Show top 10 for the preview
    });

    return rsvps.map(r => ({
      id: r.user.id,
      name: r.user.name,
      image: (r.user.profile?.photos ? JSON.parse(r.user.profile.photos)[0] : null) || `https://ui-avatars.com/api/?name=${r.user.name}`,
    }));
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return [];
  }
}

