/**
 * Cron autónomo — se ejecuta cada 4 horas automáticamente.
 * Busca nuevas empresas, las guarda en Supabase y envía emails.
 * Vercel llama a este endpoint con Authorization: Bearer {CRON_SECRET}
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const RESEND_KEY    = process.env.RESEND_API_KEY;
const CRON_SECRET   = process.env.CRON_SECRET;

const BLOCKED_EMAIL = 'info@events-barcelona.com';

// Mercados prioritarios para Barcelona — rota cada ejecución
const SEARCH_MATRIX = [
  { code: 'US', name: 'United States',  lang: 'en' },
  { code: 'DE', name: 'Germany',        lang: 'de' },
  { code: 'UK', name: 'United Kingdom', lang: 'en' },
  { code: 'FR', name: 'France',         lang: 'fr' },
  { code: 'IT', name: 'Italy',          lang: 'it' },
  { code: 'NL', name: 'Netherlands',    lang: 'nl' },
  { code: 'CH', name: 'Switzerland',    lang: 'de' },
  { code: 'BE', name: 'Belgium',        lang: 'nl' },
  { code: 'SE', name: 'Sweden',         lang: 'en' },
  { code: 'NO', name: 'Norway',         lang: 'en' },
  { code: 'DK', name: 'Denmark',        lang: 'en' },
  { code: 'JP', name: 'Japan',          lang: 'en' },
  { code: 'AU', name: 'Australia',      lang: 'en' },
];

const SECTORS = [
  'PCO (Professional Conference Organisers)',
  'DMC (Destination Management Companies)',
  'MICE',
  'Event Management Companies',
  'Agencias de eventos corporativos',
  'Organizadores de ferias y congresos',
];

// ─── Supabase helpers ────────────────────────────────────────────────────────

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function sbGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { headers: sbHeaders });
  if (!res.ok) throw new Error(`Supabase GET error: ${await res.text()}`);
  return res.json();
}

async function sbInsert(table, data, { upsert = false } = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...sbHeaders,
      'Prefer': upsert ? 'resolution=merge-duplicates,return=representation' : 'return=representation',
    },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function sbUpdate(table, match, data) {
  const params = Object.entries(match).map(([k, v]) => `${k}=eq.${encodeURIComponent(v)}`).join('&');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method: 'PATCH',
    headers: { ...sbHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidEmail(email) {
  if (!email) return false;
  if (email.toLowerCase().trim() === BLOCKED_EMAIL) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());
}

function calcLeadScore({ sector, country, eventsPerYear, companySize }) {
  const sectorScores  = { 'PCO (Professional Conference Organisers)': 30, 'DMC (Destination Management Companies)': 30, 'MICE': 25, 'Event Management Companies': 25 };
  const countryScores = { 'US': 30, 'CH': 30, 'DE': 25, 'NL': 25, 'FR': 25, 'UK': 25, 'IT': 20, 'BE': 20, 'SE': 20, 'NO': 15, 'DK': 15, 'JP': 15, 'AU': 15, 'PT': 10 };
  const eventScores   = { '10+': 30, '5-10': 20, '2-5': 10, '1': 5 };
  const sizeScores    = { 'large': 20, 'medium': 15, 'small': 10 };
  return Math.min(
    (sectorScores[sector] || 10) +
    (countryScores[country] || 10) +
    (eventScores[eventsPerYear] || 0) +
    (sizeScores[companySize] || 0),
    100
  );
}

function personalize(text, company) {
  return text.replace(/\{company\}/g, company).replace(/\{Company\}/g, company);
}

// ─── Email via Resend ────────────────────────────────────────────────────────

async function sendEmail({ to, subject, body }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Nico Unical Graphic <nico@unical.es>',
      to: [to],
      subject,
      text: body,
      reply_to: 'nico@unical.es',
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Resend error');
  return data.id;
}

// ─── Anthropic search ────────────────────────────────────────────────────────

async function searchProspects(country, sector) {
  const query = `${sector} companies ${country.name} organize corporate events Barcelona Spain email contact decision maker`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20251001',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Find 10-15 REAL companies in "${sector}" from ${country.name} that organize corporate events in Spain/Barcelona.

For each company provide:
{
  "company": "Exact Name",
  "email": "contact@company.com",
  "website": "https://...",
  "phone": "+xx...",
  "companySize": "small/medium/large",
  "eventsPerYear": "1/2-5/5-10/10+",
  "decisionMaker": "Name, Title",
  "recentEvent": "Event name if found"
}

Rules:
- Only REAL companies with verifiable websites
- Valid professional emails (not info@events-barcelona.com)
- Return ONLY a JSON array, no extra text

[...]`
      }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error: ${err}`);
  }

  const data = await res.json();
  let allText = '';
  for (const block of (data.content || [])) {
    if (block.type === 'text') allText += block.text;
  }

  const match = allText.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Verificar que viene de Vercel Cron (o llamada manual autenticada)
  const authHeader = req.headers['authorization'];
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const runId = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  let totalFound = 0;
  let totalEmailed = 0;

  // Seleccionar qué país y sector buscar en esta ejecución (rotación por hora)
  const slot = Math.floor(Date.now() / (4 * 60 * 60 * 1000));
  const country = SEARCH_MATRIX[slot % SEARCH_MATRIX.length];
  const sector  = SECTORS[Math.floor(slot / SEARCH_MATRIX.length) % SECTORS.length];

  // Registrar inicio del run
  await sbInsert('search_runs', {
    id: runId,
    countries: [country.code],
    sectors: [sector],
    status: 'running',
    started_at: startedAt,
  });

  try {
    // Obtener emails ya existentes para deduplicar
    const existing = await sbGet('/prospects?select=email');
    const usedEmails = new Set((existing || []).map(p => p.email.toLowerCase()));

    // Obtener plantillas desde Supabase
    const templates = await sbGet('/email_templates?select=*');
    const templateMap = {};
    for (const t of (templates || [])) {
      templateMap[t.language] = t;
    }

    // Buscar nuevas empresas
    const results = await searchProspects(country, sector);

    for (const result of results) {
      if (!result.company || !result.email) continue;
      if (!isValidEmail(result.email)) continue;
      if (usedEmails.has(result.email.toLowerCase())) continue;

      usedEmails.add(result.email.toLowerCase());

      const leadScore = calcLeadScore({
        sector,
        country: country.code,
        eventsPerYear: result.eventsPerYear || '2-5',
        companySize: result.companySize || 'medium',
      });

      // Guardar prospecto en Supabase
      let prospectId;
      try {
        const [saved] = await sbInsert('prospects', {
          company:         result.company.trim(),
          email:           result.email.trim().toLowerCase(),
          website:         result.website || '',
          phone:           result.phone || '',
          country:         country.code,
          sector,
          company_size:    result.companySize || 'medium',
          events_per_year: result.eventsPerYear || '2-5',
          recent_event:    result.recentEvent || '',
          decision_maker:  result.decisionMaker || '',
          lead_score:      leadScore,
          stage:           'lead',
          source:          'cron',
        });
        prospectId = saved?.id;
        totalFound++;
      } catch (e) {
        console.error('Error guardando prospecto:', e.message);
        continue;
      }

      // Enviar email en el idioma correcto
      const template = templateMap[country.lang] || templateMap['es'];
      if (template && prospectId) {
        try {
          const subject = personalize(template.subject, result.company);
          const body    = personalize(template.body, result.company);

          const resendId = await sendEmail({ to: result.email, subject, body });
          totalEmailed++;

          // Registrar email enviado
          await sbInsert('emails_sent', {
            prospect_id: prospectId,
            to_email:    result.email,
            company:     result.company,
            subject,
            body,
            resend_id:   resendId,
            auto_sent:   true,
          });

          // Actualizar etapa a contactado
          await sbUpdate('prospects', { id: prospectId }, {
            stage:          'contacted',
            last_contact:   new Date().toISOString(),
            next_follow_up: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          });

          // Crear recordatorio de seguimiento a 3 días
          await sbInsert('reminders', {
            prospect_id: prospectId,
            message:     `Seguimiento cron → ${result.company}`,
            due_date:    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          });

          // Registrar actividad
          await sbInsert('activities', {
            prospect_id: prospectId,
            type:        'email_sent',
            description: `Email automático (cron): ${subject}`,
          });

          // Pausa para respetar rate limits
          await new Promise(r => setTimeout(r, 400));

        } catch (e) {
          console.error(`Error enviando email a ${result.email}:`, e.message);
        }
      }
    }

    // Cerrar el run como completado
    await sbUpdate('search_runs', { id: runId }, {
      status:      'completed',
      total_found:   totalFound,
      total_emailed: totalEmailed,
      ended_at:    new Date().toISOString(),
    });

    return res.status(200).json({
      ok: true,
      country: country.name,
      sector,
      found:   totalFound,
      emailed: totalEmailed,
    });

  } catch (err) {
    console.error('Cron error:', err);
    await sbUpdate('search_runs', { id: runId }, {
      status:    'error',
      error_msg: err.message,
      ended_at:  new Date().toISOString(),
    });
    return res.status(500).json({ error: err.message });
  }
}
