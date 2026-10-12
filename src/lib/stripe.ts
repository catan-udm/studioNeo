import Stripe from 'stripe';
import { execute, queryRows } from './db';

// Initialize Stripe singleton if STRIPE_SECRET_KEY is provided
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripeClient = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-03-20.acacia' as Stripe.LatestApiVersion,
      typescript: true,
    })
  : null;

export type MembershipTier = 'free' | 'collector' | 'studio';
export type BillingCycle = 'monthly' | 'annual';

export interface CheckoutSessionOptions {
  tier: MembershipTier;
  billingCycle?: BillingCycle;
  subscriberId: number | string;
  email: string;
  baseUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
  isMock: boolean;
}

/**
 * Creates a Stripe Checkout Session for subscriber tier acquisition.
 * In development or when STRIPE_SECRET_KEY is not set, generates a simulated mock checkout flow.
 */
export async function createCheckoutSession(
  options: CheckoutSessionOptions
): Promise<CheckoutSessionResult> {
  const { tier, billingCycle = 'monthly', subscriberId, email, baseUrl } = options;

  const successUrl = `${baseUrl}/dashboard?subscription=success&tier=${tier}&cycle=${billingCycle}`;
  const cancelUrl = `${baseUrl}/membership?subscription=canceled`;

  // Fallback: Mock checkout flow for local development / test environments
  if (!stripeClient || !stripeSecretKey || stripeSecretKey.startsWith('mock_') || stripeSecretKey.includes('placeholder')) {
    const mockSessionId = `mock_cs_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    // Auto-fulfill tier for the subscriber in mock mode
    await applySubscriptionToSubscriber(subscriberId, tier, 'mock_cust_' + subscriberId, 'mock_sub_' + subscriberId);

    return {
      sessionId: mockSessionId,
      url: successUrl,
      isMock: true,
    };
  }

  // Live Stripe Integration
  const unitAmount =
    tier === 'collector'
      ? billingCycle === 'annual'
        ? 12000 // $120/yr
        : 1200 // $12/mo
      : tier === 'studio'
      ? billingCycle === 'annual'
        ? 48000 // $480/yr
        : 4900 // $49/mo
      : 0;

  const session = await stripeClient.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: email,
    client_reference_id: subscriberId.toString(),
    metadata: {
      subscriberId: subscriberId.toString(),
      tier,
      billingCycle,
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name:
              tier === 'collector'
                ? 'bikko.studio • Archive Member (Collector)'
                : 'bikko.studio • Studio Commercial Lab',
            description:
              tier === 'collector'
                ? 'Direct access to 128 losslessly preserved vector cels, subscriber vaults, and raw SVG stems.'
                : 'Full commercial reproduction license, unlimited SVG stems, and multi-seat studio access.',
          },
          unit_amount: unitAmount,
          recurring: {
            interval: billingCycle === 'annual' ? 'year' : 'month',
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
  });

  return {
    sessionId: session.id,
    url: session.url || successUrl,
    isMock: false,
  };
}

/**
 * Applies or upgrades a subscriber's membership tier and grants corresponding vault perk unlocks.
 */
export async function applySubscriptionToSubscriber(
  subscriberId: number | string,
  tier: MembershipTier,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
): Promise<void> {
  try {
    // 1. Update subscriber tier & Stripe references
    await execute(
      `UPDATE subscribers 
       SET tier = ?, subscription_status = 'active', stripe_customer_id = COALESCE(?, stripe_customer_id), stripe_subscription_id = COALESCE(?, stripe_subscription_id)
       WHERE id = ?`,
      [tier, stripeCustomerId || null, stripeSubscriptionId || null, subscriberId]
    );

    // 2. If tier is collector or studio, automatically grant all core perk unlocks
    if (tier === 'collector' || tier === 'studio') {
      const allPerks = await queryRows<{ id: number }>('SELECT id FROM perks');
      for (const perk of allPerks) {
        try {
          await execute(
            'INSERT IGNORE INTO perk_unlocks (subscriber_id, perk_id) VALUES (?, ?)',
            [subscriberId, perk.id]
          );
        } catch {
          // Ignore duplicates
        }
      }
    }
  } catch (err) {
    console.warn('[Stripe] Failed to update subscriber tier in DB:', err);
  }
}

/**
 * Validates Stripe webhook signature and returns parsed event.
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  if (!stripeClient) {
    throw new Error('Stripe client is not initialized.');
  }
  return stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
}

const stripeService = {
  createCheckoutSession,
  applySubscriptionToSubscriber,
  constructWebhookEvent,
};

export default stripeService;
