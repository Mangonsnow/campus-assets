// netlify/functions/send-email.js
// Sends transactional emails via Resend.
// Expects a JSON body: { to, subject, body }
//   `to` can be a string or an array of email addresses.
//   Each recipient gets their own individual Resend API call so that
//   a single failed address never blocks delivery to the others.
//
// Environment variables (set in Netlify dashboard):
//   RESEND_API_KEY  — your Resend secret key
//   RESEND_FROM     — verified sender, e.g. "Campus Assets <noreply@yourdomain.com>"
//                     Falls back to onboarding@resend.dev for local testing ONLY —
//                     that sandbox address only delivers to your own Resend account email.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Invalid JSON body' }),
    };
  }

  const { to, subject, body } = payload;

  if (!to || !subject || !body) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Missing required fields: to, subject, body' }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'RESEND_API_KEY not configured on server' }),
    };
  }

  const fromAddress = process.env.RESEND_FROM || 'Campus Assets <onboarding@resend.dev>';

  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!recipients.length) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'No valid recipients' }),
    };
  }

  const textBody = String(body);
  const htmlBody = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;color:#222">${
    textBody.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  }</div>`;

  const results = await Promise.allSettled(
    recipients.map(async (addr) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [addr],
          subject,
          text: textBody,
          html: htmlBody,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error(`[send-email] Resend error for ${addr}:`, res.status, data);
        throw new Error(data?.message || `Resend HTTP ${res.status}`);
      }
      console.log(`[send-email] ✓ sent to ${addr}, id:`, data?.id);
      return { addr, id: data?.id };
    })
  );

  const succeeded = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  const failed    = results.filter(r => r.status === 'rejected').map((r, i) => ({
    addr: recipients[results.indexOf(r)],
    error: r.reason?.message || 'unknown',
  }));

  console.log(`[send-email] ${succeeded.length}/${recipients.length} delivered`, failed.length ? `| failures: ${JSON.stringify(failed)}` : '');

  if (succeeded.length === 0) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: failed[0]?.error || 'All sends failed', failed }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok: true,
      id: succeeded[0]?.id || null,
      sent: succeeded.length,
      total: recipients.length,
      ...(failed.length ? { partialFailures: failed } : {}),
    }),
  };
};
