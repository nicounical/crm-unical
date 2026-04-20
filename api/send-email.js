const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, body, prospectId, company } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Faltan campos: to, subject, body' });
  }
  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY no configurada' });
  }

  try {
    // Enviar via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nico Unical Graphic <nico@unical.es>',
        to: [to],
        subject,
        text: body,
        reply_to: 'nico@unical.es',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Error al enviar' });
    }

    // Guardar registro en Supabase (si está configurado)
    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/emails_sent`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prospect_id: prospectId || null,
            to_email:    to,
            company:     company || '',
            subject,
            body,
            resend_id:   data.id,
            auto_sent:   false,
          }),
        });
      } catch (e) {
        // No bloqueamos el envío si falla el log
        console.error('Error guardando en Supabase:', e.message);
      }
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    console.error('Error inesperado:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}
