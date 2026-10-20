/**
 * Generic transactional email helper backed by Azure Communication Services (ACS).
 * Used for studio notifications (e.g. contact form inquiries).
 * OTP delivery lives in `auth.ts` (`sendOTPEmail`) and uses the same ACS credentials.
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  plainText: string;
  html?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  sent: boolean;
  channel: 'acs' | 'skipped';
  error?: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sends an email through ACS. When AZURE_COMMUNICATION_CONNECTION_STRING is not set,
 * the send is skipped (never throws) so local development keeps working.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING;
  const sender = process.env.ACS_SENDER_EMAIL;

  if (!connectionString || !sender) {
    console.warn('[Email] ACS is not configured (AZURE_COMMUNICATION_CONNECTION_STRING / ACS_SENDER_EMAIL); skipping send.');
    return { sent: false, channel: 'skipped' };
  }

  try {
    const { EmailClient } = await import('@azure/communication-email');
    const client = new EmailClient(connectionString);

    const poller = await client.beginSend({
      senderAddress: sender,
      content: {
        subject: input.subject,
        plainText: input.plainText,
        ...(input.html ? { html: input.html } : {}),
      },
      recipients: { to: [{ address: input.to }] },
      ...(input.replyTo ? { replyTo: [{ address: input.replyTo }] } : {}),
    });

    await poller.pollUntilDone();
    return { sent: true, channel: 'acs' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Email] Failed to send email via Azure Communication Services:', message);
    return { sent: false, channel: 'acs', error: message };
  }
}
