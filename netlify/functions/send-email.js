// netlify/functions/send-email.js
// Sends a transactional email via Resend.
// Expects a JSON body: { to, subject, body }
// Uses RESEND_API_KEY from Netlify environment variables.
// Returns { ok: true, id } on success or { ok: false, error } on failure.

exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  // Parse payload
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

  // Validate required fields
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

  // Normalise 'to' — Resend accepts a string or an array
  const recipients = Array.isArray(to) ? to : [to];

  // Build plain-text and simple HTML bodies
  const textBody = String(body);
  const htmlBody = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.5;color:#222">${
    textBody.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
  }</div>`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Default Resend sandbox domain. Replace with your own domain once verified.
        from: 'Campus Assets <onboarding@resend.dev>',
        to: recipients,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[send-email] Resend error:', res.status, data);
      return {
        statusCode: res.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: data?.message || `Resend HTTP ${res.status}` }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, id: data?.id || null }),
    };
  } catch (e) {
    console.error('[send-email] fetch failed:', e.message);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: e.message || 'Network error calling Resend' }),
    };
  }
};
