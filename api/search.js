/**
 * /api/search — Edge Runtime. Búsqueda gratuita via DuckDuckGo + parsing.
 * No requiere API key de Anthropic ni ningún otro servicio de pago.
 */

export const config = { runtime: 'edge' };

const BLOCKED_EMAIL = 'info@events-barcelona.com';

// Extrae emails de un texto
function extractEmails(text) {
  const matches = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [];
  return matches.filter(e =>
    e !== BLOCKED_EMAIL &&
    !e.includes('example') &&
    !e.includes('test') &&
    !e.includes('placeholder') &&
    !e.endsWith('.png') &&
    !e.endsWith('.jpg')
  );
}

// Extrae dominio limpio de una URL
function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

// Genera email probable basado en dominio (solo patrones comunes)
function guessEmail(domain, sector) {
  if (!domain || domain.length < 4) return '';
  const keywords = ['events', 'mice', 'congress', 'conference', 'meeting'];
  const prefix = keywords.some(k => sector.toLowerCase().includes(k)) ? 'events' : 'info';
  return `${prefix}@${domain}`;
}

// Mapea sector a tamaño estimado
function estimateSize(snippet) {
  const text = snippet.toLowerCase();
  if (text.includes('global') || text.includes('international') || text.includes('worldwide')) return 'large';
  if (text.includes('boutique') || text.includes('independent') || text.includes('small')) return 'small';
  return 'medium';
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json' }
    });
  }

  let body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Body inválido' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  const { query, countryName, sector } = body;
  if (!query || !countryName || !sector) {
    return new Response(JSON.stringify({ error: 'Faltan parámetros' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Búsqueda via DuckDuckGo HTML (gratuito, sin API key)
    const searchQuery = encodeURIComponent(`${sector} company ${countryName} events Spain contact email site:.com OR site:.co.uk OR site:.de OR site:.fr`);
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${searchQuery}`;

    const response = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; research-bot/1.0)',
        'Accept': 'text/html',
      }
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo error: ${response.status}`);
    }

    const html = await response.text();

    // Parsea resultados del HTML de DDG
    const results = [];
    const seen = new Set();

    // Extrae bloques de resultados con regex sobre el HTML
    const resultBlocks = html.match(/<div class="result[^"]*"[\s\S]*?(?=<div class="result[^"]*"|$)/g) || [];

    for (const block of resultBlocks.slice(0, 20)) {
      // Extrae título
      const titleMatch = block.match(/<a class="result__a"[^>]*>([^<]+)<\/a>/);
      const company = titleMatch ? titleMatch[1].trim().split(' - ')[0].split(' | ')[0] : '';

      // Extrae URL
      const urlMatch = block.match(/href="([^"]+)"/);
      let website = '';
      if (urlMatch) {
        const rawUrl = urlMatch[1];
        if (rawUrl.startsWith('http')) {
          website = rawUrl.split('?')[0];
        } else if (rawUrl.includes('uddg=')) {
          const decoded = decodeURIComponent(rawUrl.split('uddg=')[1] || '');
          website = decoded.split('&')[0];
        }
      }

      // Extrae snippet
      const snippetMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
      const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (!company || company.length < 2) continue;
      if (!website || !website.startsWith('http')) continue;

      const domain = extractDomain(website);
      if (!domain || seen.has(domain)) continue;

      // Filtra resultados que parecen directorios o no empresas
      if (website.includes('linkedin.com') || website.includes('facebook.com') ||
          website.includes('twitter.com') || website.includes('wikipedia.org') ||
          website.includes('yelp.com') || website.includes('tripadvisor')) continue;

      seen.add(domain);

      const emails = extractEmails(snippet + ' ' + company);
      const email = emails[0] || '';

      results.push({
        company: company.substring(0, 80),
        email: email !== BLOCKED_EMAIL ? email : '',
        hasContactForm: !email,
        website,
        linkedin: '',
        phone: '',
        companySize: estimateSize(snippet),
        eventsPerYear: '2-5',
        recentEvent: '',
        decisionMaker: '',
        painPoint: snippet.substring(0, 120) || ''
      });

      if (results.length >= 12) break;
    }

    return new Response(JSON.stringify({ results }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
