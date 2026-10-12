import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
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

    // Persist inquiry to database
    try {
      await execute(
        `INSERT INTO inquiries (name, email, organization, topic, message)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, organization || null, topic, message]
      );
    } catch (dbErr) {
      console.warn('[Contact API] Note: Failed to insert inquiry into database, continuing with response:', dbErr);
    }

    console.log(`[Studio Inquiries] New inquiry received from ${name} <${email}> regarding "${topic}"`);

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
