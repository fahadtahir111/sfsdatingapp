import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/lib/server/services/BillingService";
import { UserRole } from "@/lib/server/middleware/auth";

// This endpoint handles Stripe webhooks
export async function POST(req: NextRequest) {
  const body = await req.text();

  // In production: const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  // For now, simulate event processing
  const event = JSON.parse(body);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await BillingService.handleSubscriptionCreated({
          userId: session.client_reference_id,
          stripeSubId: session.subscription,
          tier: session.metadata.tier as UserRole,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await BillingService.handleSubscriptionCancelled(subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
