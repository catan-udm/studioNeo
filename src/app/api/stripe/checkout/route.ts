import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { createCheckoutSession, MembershipTier, BillingCycle } from '@/lib/stripe';

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
  const proto = request.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  const envUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    return envUrl.replace(/\/+$/, '');
  }
  return `${proto}://${host}`.replace(/\/+$/, '');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || !session.subscriberId) {
      return NextResponse.json(
        {
          error: 'Authentication required. Please sign in or register to select a membership tier.',
          redirectUrl: '/login?redirect=/membership',
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawTier = body.tier as string;
    const rawCycle = body.billingCycle as string;

    const tier: MembershipTier = rawTier === 'studio' ? 'studio' : 'collector';
    const billingCycle: BillingCycle = rawCycle === 'annual' ? 'annual' : 'monthly';

    const baseUrl = getBaseUrl(request);

    const result = await createCheckoutSession({
      tier,
      billingCycle,
      subscriberId: session.subscriberId,
      email: session.email,
      baseUrl,
    });

    return NextResponse.json(
      {
        success: true,
        sessionId: result.sessionId,
        url: result.url,
        isMock: result.isMock,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/stripe/checkout] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while preparing the membership checkout session.' },
      { status: 500 }
    );
  }
}
