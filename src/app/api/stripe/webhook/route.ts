import { NextRequest, NextResponse } from 'next/server';
import { stripeClient, constructWebhookEvent, applySubscriptionToSubscriber, MembershipTier } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const rawBody = await request.text();
    let event: Stripe.Event;

    if (stripeClient && webhookSecret && signature) {
      try {
        event = constructWebhookEvent(rawBody, signature, webhookSecret);
      } catch (err: unknown) {
        console.error('[Stripe Webhook] Signature verification failed:', err);
        return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
      }
    } else {
      // In development / testing or mock mode without webhook secret.
      // NOTE: Stripe is mock-only in this university project (all products are mock products),
      // so unsigned payloads are intentionally accepted. Do not reuse this handler with real payments.
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriberId = session.metadata?.subscriberId || session.client_reference_id;
        const tier = (session.metadata?.tier || 'collector') as MembershipTier;
        const customerId = typeof session.customer === 'string' ? session.customer : undefined;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : undefined;

        if (subscriberId) {
          await applySubscriptionToSubscriber(Number(subscriberId), tier, customerId, subscriptionId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriberId = subscription.metadata?.subscriberId;
        const tier = (subscription.metadata?.tier || 'collector') as MembershipTier;

        if (subscriberId) {
          await applySubscriptionToSubscriber(
            Number(subscriberId),
            tier,
            typeof subscription.customer === 'string' ? subscription.customer : undefined,
            subscription.id
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subscriberId = subscription.metadata?.subscriberId;
        if (subscriberId) {
          await applySubscriptionToSubscriber(Number(subscriberId), 'free');
        }
        break;
      }

      default:
        // Other events ignored cleanly
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: unknown) {
    console.error('[API /api/stripe/webhook] Error:', error);
    return NextResponse.json({ error: 'Internal webhook processing failure' }, { status: 500 });
  }
}
