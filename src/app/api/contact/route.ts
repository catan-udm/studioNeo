import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { sendEmail, escapeHtml } from '@/lib/email';
import { isRateLimited } from '@/lib/rateLimit';

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MIN_SUBMIT_TIME_MS = 3000;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Spam defence 1: per-IP rate limit
    if (isRateLimited(`contact:${getClientIp(request)}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    // Spam defence 2: honeypot field (hidden from humans) and 3: minimum time-to-submit.
    // Bots get a silent fake success so they gain no signal about the checks.
    const honeypot = typeof body.website === 'string' ? body.website.trim() : '';
    const startedAt = typeof body.startedAt === 'number' ? body.startedAt : NaN;
    const elapsed = Date.now() - startedAt;
    if (honeypot || !Number.isFinite(elapsed) || elapsed < MIN_SUBMIT_TIME_MS) {
      console.warn('[Contact API] Submission rejected by spam checks (honeypot / timing).');
      return NextResponse.json({ success: true, message: 'Your inquiry has been successfully transmitted to the studioNeo curatorial desk.' }, { status: 200 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const organization = typeof body.organization === 'string' ? body.organization.trim() : null;
    const topic = typeof body.topic === 'string' ? body.topic.trim() : 'general';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: 'Please provide your name (minimum 2 characters).' },
        { status: 422 }
      );
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 422 }
      );
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: 'Please provide project specifications or message (minimum 10 characters).' },
        { status: 422 }
      );
    }

    // Persist inquiry to database; a failure here must be reported, not hidden.
    try {
      await execute(
        `INSERT INTO inquiries (name, email, organization, topic, message)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, organization || null, topic, message]
      );
    } catch (dbErr) {
      console.error('[Contact API] Failed to insert inquiry into database:', dbErr);
      return NextResponse.json(
        { error: 'We could not record your inquiry right now. Please try again shortly.' },
        { status: 500 }
      );
    }

    console.log(`[Studio Inquiries] New inquiry received from ${name} <${email}> regarding "${topic}"`);

    // Notify the studio desk via ACS. The inquiry is already stored, so a send failure is non-fatal.
    const notifyTo = process.env.CONTACT_NOTIFY_EMAIL;
    if (notifyTo) {
      await sendEmail({
        to: notifyTo,
        replyTo: email,
        subject: `[studioNeo] New ${topic} inquiry from ${name}`,
        plainText: `From: ${name} <${email}>\nOrganization: ${organization || 'N/A'}\nTopic: ${topic}\n\n${message}`,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>New studio inquiry</h2>
          <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
          <p><strong>Organization:</strong> ${escapeHtml(organization || 'N/A')}</p>
          <p><strong>Topic:</strong> ${escapeHtml(topic)}</p>
          <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(message)}</pre>
        </div>`,
      });
    } else {
      console.warn('[Contact API] CONTACT_NOTIFY_EMAIL is not set; skipping studio notification email.');
    }

    return NextResponse.json(
      {
        success: true,
        message:
          topic === 'artist_application' || topic === 'artist'
            ? 'Your Resident Artist Portfolio Application has been successfully transmitted to the curatorial desk.'
            : 'Your inquiry has been successfully transmitted to the studioNeo curatorial desk.',
        inquiry: {
          name,
          email,
          topic,
          receivedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[API /api/contact] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while transmitting your inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
