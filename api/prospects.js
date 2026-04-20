const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const sbHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

// Convierte columnas snake_case de Supabase al formato camelCase del frontend
function toFrontend(p) {
  return {
    id:             p.id,
    company:        p.company || 'Sin nombre',
    email:          p.email || '',
    website:        p.website || '',
    phone:          p.phone || '',
    linkedin:       p.linkedin || '',
    country:        p.country || '',
    sector:         p.sector || '',
    companySize:    p.company_size || 'medium',
    eventsPerYear:  p.events_per_year || '2-5',
    recentEvent:    p.recent_event || '',
    decisionMaker:  p.decision_maker || '',
    painPoint:      p.pain_point || '',
    notes:          p.notes || '',
    tags:           [],
    stage:          p.stage || 'lead',
    dealValue:      p.deal_value || 5000,
    probability:    p.probability || 10,
    leadScore:      p.lead_score || 0,
    emailOpened:    p.email_opened || false,
    emailReplied:   p.email_replied || false,
    lastContact:    p.last_contact || null,
    nextFollowUp:   p.next_follow_up || null,
    source:         p.source || 'cron',
    createdAt:      p.created_at,
    updatedAt:      p.updated_at,
  };
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase no configurado' });
  }

  // GET — devuelve todos los prospects de Supabase
  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/prospects?select=*&order=created_at.desc&limit=1000`,
        { headers: sbHeaders }
      );
      const data = await response.json();
      return res.status(200).json((data || []).map(toFrontend));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH — actualiza etapa, notas, deal value etc. desde el frontend
  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'Falta id' });

    // Convierte camelCase → snake_case para Supabase
    const dbUpdates = {};
    if (updates.stage          !== undefined) dbUpdates.stage           = updates.stage;
    if (updates.dealValue      !== undefined) dbUpdates.deal_value      = updates.dealValue;
    if (updates.probability    !== undefined) dbUpdates.probability     = updates.probability;
    if (updates.leadScore      !== undefined) dbUpdates.lead_score      = updates.leadScore;
    if (updates.notes          !== undefined) dbUpdates.notes           = updates.notes;
    if (updates.lastContact    !== undefined) dbUpdates.last_contact    = updates.lastContact;
    if (updates.nextFollowUp   !== undefined) dbUpdates.next_follow_up  = updates.nextFollowUp;
    if (updates.emailOpened    !== undefined) dbUpdates.email_opened    = updates.emailOpened;
    if (updates.emailReplied   !== undefined) dbUpdates.email_replied   = updates.emailReplied;
    if (updates.companySize    !== undefined) dbUpdates.company_size    = updates.companySize;
    if (updates.eventsPerYear  !== undefined) dbUpdates.events_per_year = updates.eventsPerYear;

    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/prospects?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: { ...sbHeaders, 'Prefer': 'return=representation' },
          body: JSON.stringify(dbUpdates),
        }
      );
      const data = await response.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
