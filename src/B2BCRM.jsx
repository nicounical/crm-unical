import React, { useState, useEffect } from 'react';
import { Search, Download, Trash2, Plus, Globe, Mail, Send, Edit, X, TrendingUp, Calendar, DollarSign, Target, Phone, MessageCircle, Bell, BarChart3, Zap, Award } from 'lucide-react';

const BLOCKED_EMAIL = 'info@events-barcelona.com';

// Mapa país → plantilla de idioma para auto-envío
const COUNTRY_TEMPLATE_MAP = {
  'US': 'template_en',
  'UK': 'template_en',
  'AU': 'template_en',
  'DE': 'template_de',
  'FR': 'template_fr',
  'IT': 'template_it',
  'NL': 'template_nl',
  'BE': 'template_nl',
  'CH': 'template_de',
  'SE': 'template_en',
  'NO': 'template_en',
  'DK': 'template_en',
  'JP': 'template_en',
  'PT': 'template_es',
};

const COUNTRIES = [
  // Mercados principales MICE Barcelona (mayor volumen de eventos)
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱' },
  { code: 'CH', name: 'Suiza', flag: '🇨🇭' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  // Mercados secundarios con alta actividad en Barcelona
  { code: 'SE', name: 'Suecia', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
];

const SECTORS = [
  'Agencias de eventos corporativos',
  'Organizadores de ferias y congresos',
  'MICE',
  'Asociaciones profesionales',
  'PCO (Professional Conference Organisers)',
  'Event Management Companies',
  'DMC (Destination Management Companies)'
];

const PIPELINE_STAGES = [
  { value: 'lead', label: 'Nuevo Lead', probability: 10, color: 'bg-gray-100 text-gray-800' },
  { value: 'contacted', label: 'Contactado', probability: 20, color: 'bg-blue-100 text-blue-800' },
  { value: 'meeting_scheduled', label: 'Reunión Agendada', probability: 40, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'proposal_sent', label: 'Propuesta Enviada', probability: 60, color: 'bg-purple-100 text-purple-800' },
  { value: 'negotiation', label: 'Negociación', probability: 80, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'won', label: 'Ganado', probability: 100, color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Perdido', probability: 0, color: 'bg-red-100 text-red-800' }
];

const LEAD_SCORE_CRITERIA = {
  sector: { 'PCO (Professional Conference Organisers)': 30, 'DMC (Destination Management Companies)': 30, 'MICE': 25, 'Event Management Companies': 25 },
  country: { 'US': 30, 'CH': 30, 'DE': 25, 'NL': 25, 'FR': 25, 'UK': 25, 'IT': 20, 'BE': 20, 'SE': 20, 'NO': 15, 'DK': 15, 'JP': 15, 'AU': 15, 'PT': 10 },
  eventsPerYear: { '10+': 30, '5-10': 20, '2-5': 10, '1': 5 },
  companySize: { 'large': 20, 'medium': 15, 'small': 10 }
};

const DEFAULT_TEMPLATES = [
  {
    id: 'template_es',
    name: 'Presentación Genérica - Español',
    subject: 'Partner 360º para ferias, congresos y eventos en España',
    body: 'Buenos días,\n\nSoy Nicolas Benitez, encargado de desarrollo de Unical Graphic. Nos gustaría presentarnos como partner 360º para agencias de publicidad/marketing que necesiten equipo de diseño, producción e instalación en ferias, congresos, eventos, decoración interior, exterior, imagen corporativa y rotulación de flotas… con cobertura en todo el territorio español y países de la Unión Europea, donde realizamos la producción de muchos eventos, congresos y ferias.\n\nQué hacemos:\n• Organización de ferias y congresos: photocalls, rígidos, banderolas, textiles, vinilos, letras corpóreas.\n• Producción: impresión digital gran formato (lonas, vinilos, textiles, rígidos), PLV/displays, totems, elementos de branding y soportes a medida.\n• Branding para franquicias: imagen corporativa, diseño interior y exterior.\n• Stands: modulares y a medida, desde concepto a entrega llave en mano.\n• Señalética integral: direccional, acreditaciones, safety y ambientación del recinto.\n• Rotulación de vehículos y flotas (para activaciones y logística de marca).\n• Decoración de interiores/imagen corporativa para espacios efímeros o permanentes.\n• Decoración de oficinas (interior y exterior).\n• Hostelería & Restaurantes: renovaciones, obras, reformas decorativas con vinilos de revestimiento y texturas.\n• Colegios & oficinas: vinilos, láminas solares, pictos, señalética y mucho más.\n\nCatálogo general: https://drive.google.com/file/d/14os32vAe747lEStnwy8Zl7tlyFU6kLLb/view?usp=sharing\nCatálogo renovación hoteles y restaurantes: https://drive.google.com/file/d/1uf2VsEVLg7G-yjJqi4S8ttHmtrXgyRIa/view?usp=drive_link\n\nSi te encaja explorar algún tipo de servicio o necesidad, propongo una llamada de 10–15\'\' para revisar cómo encajamos. Nuestro objetivo es convertirnos en un partner de confianza para empresas como la vuestra.\n\nQuedo atento. Gracias por tu tiempo,\n\nNico\nNicolas Benitez — Business Development\nUnical Graphic · nico@unical.es'
  },
  {
    id: 'template_en',
    name: 'Generic Presentation - English',
    subject: '360° Partner for Fairs, Congresses & Events in Spain',
    body: 'Good morning,\n\nMy name is Nicolas Benitez, Head of Business Development at Unical Graphic. We would like to introduce ourselves as a 360° partner for advertising/marketing agencies that need a design, production and installation team for fairs, congresses, events, interior and exterior decoration, corporate image and fleet branding — covering the entire Spanish territory and EU countries, where we carry out production for many events, congresses and fairs.\n\nWhat we do:\n• Fair and congress organisation: photocalls, rigid displays, banners, textiles, vinyl, built-up lettering.\n• Production: large format digital printing (banners, vinyls, textiles, rigid materials), POS/displays, totems, branding elements and custom supports.\n• Franchise branding: corporate image, interior and exterior design.\n• Stands: modular and custom-built, from concept to turnkey delivery.\n• Comprehensive signage: directional, accreditations, safety and venue dressing.\n• Vehicle and fleet branding (for brand activations and logistics).\n• Interior decoration/corporate image for ephemeral or permanent spaces.\n• Office decoration (interior and exterior).\n• Hospitality & Restaurants: renovations, decorative refurbishments using coating vinyls and textures.\n• Schools & offices: vinyls, solar films, pictograms, signage and much more.\n\nGeneral catalogue: https://drive.google.com/file/d/14os32vAe747lEStnwy8Zl7tlyFU6kLLb/view?usp=sharing\nHotel & restaurant renovation catalogue: https://drive.google.com/file/d/1uf2VsEVLg7G-yjJqi4S8ttHmtrXgyRIa/view?usp=drive_link\n\nIf this fits with any service or need you have, I propose a 10–15 min call to review how we can work together. Our goal is to become a trusted partner for companies like yours.\n\nLooking forward to hearing from you. Thank you for your time,\n\nNico\nNicolas Benitez — Business Development\nUnical Graphic · nico@unical.es'
  },
  {
    id: 'template_de',
    name: 'Allgemeine Vorstellung - Deutsch',
    subject: '360°-Partner für Messen, Kongresse und Events in Spanien',
    body: 'Guten Morgen,\n\nmein Name ist Nicolas Benitez, zuständig für die Geschäftsentwicklung bei Unical Graphic. Wir möchten uns als 360°-Partner für Werbe-/Marketingagenturen vorstellen, die ein Team für Design, Produktion und Installation bei Messen, Kongressen, Events, Innen- und Außendekoration, Corporate Identity und Flottenbeklebung benötigen — mit Abdeckung im gesamten spanischen Gebiet und EU-Ländern, wo wir die Produktion für viele Events, Kongresse und Messen übernehmen.\n\nWas wir machen:\n• Messen und Kongressorganisation: Photocalls, Hartschaumtafeln, Banner, Textilien, Folien, Leuchtbuchstaben.\n• Produktion: Digitaldruck im Großformat (Planen, Folien, Textilien, Hartschaumtafeln), POS/Displays, Totems, Branding-Elemente und Sonderbauten.\n• Franchise-Branding: Corporate Identity, Innen- und Außengestaltung.\n• Messestände: modular und individuell, vom Konzept bis zur schlüsselfertigen Übergabe.\n• Umfassendes Beschilderungssystem: Wegweisung, Akkreditierungen, Sicherheit und Raumgestaltung.\n• Fahrzeug- und Flottenbeklebung (für Markenaktivierungen und -logistik).\n• Innendekoration/Corporate Identity für ephemere oder dauerhafte Räume.\n• Bürodekoration (innen und außen).\n• Hotellerie & Restaurants: Renovierungen, dekorative Umgestaltungen mit Beschichtungsfolien und Texturen.\n• Schulen & Büros: Folien, Sonnenschutzfolien, Piktogramme, Beschilderung und vieles mehr.\n\nHauptkatalog: https://drive.google.com/file/d/14os32vAe747lEStnwy8Zl7tlyFU6kLLb/view?usp=sharing\nKatalog Hotel- und Restaurantrenovierung: https://drive.google.com/file/d/1uf2VsEVLg7G-yjJqi4S8ttHmtrXgyRIa/view?usp=drive_link\n\nFalls dies zu einem Ihrer Bedürfnisse passt, schlage ich ein 10–15-minütiges Gespräch vor. Unser Ziel ist es, ein vertrauenswürdiger Partner für Ihr Unternehmen zu werden.\n\nIch freue mich auf Ihre Rückmeldung. Vielen Dank für Ihre Zeit,\n\nNico\nNicolas Benitez — Business Development\nUnical Graphic · nico@unical.es'
  },
  {
    id: 'template_fr',
    name: 'Présentation Générique - Français',
    subject: 'Partenaire 360° pour salons, congrès et événements en Espagne',
    body: 'Bonjour,\n\nJe m\'appelle Nicolas Benitez, responsable du développement commercial chez Unical Graphic. Nous souhaitons nous présenter comme partenaire 360° pour les agences de publicité/marketing qui ont besoin d\'une équipe de conception, production et installation pour salons, congrès, événements, décoration intérieure et extérieure, image de marque et covering de flotte — avec une couverture sur tout le territoire espagnol et les pays de l\'Union Européenne.\n\nCe que nous faisons :\n• Organisation de salons et congrès : photocalls, supports rigides, banderoles, textiles, vinyles, lettres en relief.\n• Production : impression numérique grand format (bâches, vinyles, textiles, rigides), PLV/displays, totems, éléments de branding et supports sur mesure.\n• Branding pour franchises : image de marque, conception intérieure et extérieure.\n• Stands : modulaires et sur mesure, du concept à la livraison clé en main.\n• Signalétique intégrale : directionnelle, accréditations, sécurité et habillage de site.\n• Covering de véhicules et flottes (pour les activations de marque et la logistique).\n• Décoration intérieure/image de marque pour des espaces éphémères ou permanents.\n• Décoration de bureaux (intérieur et extérieur).\n• Hôtellerie & Restauration : rénovations, réaménagements décoratifs avec vinyles de revêtement et textures.\n• Écoles & bureaux : vinyles, films solaires, pictogrammes, signalétique et bien plus.\n\nCatalogue général : https://drive.google.com/file/d/14os32vAe747lEStnwy8Zl7tlyFU6kLLb/view?usp=sharing\nCatalogue rénovation hôtels et restaurants : https://drive.google.com/file/d/1uf2VsEVLg7G-yjJqi4S8ttHmtrXgyRIa/view?usp=drive_link\n\nSi cela correspond à un besoin de votre côté, je vous propose un appel de 10–15 min. Notre objectif est de devenir un partenaire de confiance pour votre entreprise.\n\nDans l\'attente de votre réponse. Merci pour votre temps,\n\nNico\nNicolas Benitez — Business Development\nUnical Graphic · nico@unical.es'
  },
  {
    id: 'template_it',
    name: 'Presentazione Generica - Italiano',
    subject: 'Partner 360° per fiere, congressi ed eventi in Spagna',
    body: 'Buongiorno,\n\nMi chiamo Nicolas Benitez, responsabile dello sviluppo commerciale di Unical Graphic. Ci farebbe piacere presentarci come partner 360° per agenzie di pubblicità/marketing che necessitano di un team di design, produzione e installazione per fiere, congressi, eventi, decorazione di interni ed esterni, immagine aziendale e branding fleet — con copertura su tutto il territorio spagnolo e nei paesi dell\'Unione Europea.\n\nCosa facciamo:\n• Organizzazione di fiere e congressi: photocall, supporti rigidi, bandiere, tessili, vinili, lettere tridimensionali.\n• Produzione: stampa digitale di grande formato (teli, vinili, tessili, supporti rigidi), PLV/display, totem, elementi di branding e supporti su misura.\n• Branding per franchising: immagine aziendale, design degli interni e degli esterni.\n• Stand: modulari e su misura, dal concept alla consegna chiavi in mano.\n• Segnaletica integrata: direzionale, accreditamenti, sicurezza e allestimento del sito.\n• Decorazione di veicoli e flotte (per attivazioni di brand e logistica).\n• Decorazione di interni/immagine aziendale per spazi effimeri o permanenti.\n• Decorazione di uffici (interni ed esterni).\n• Hospitality & Ristoranti: ristrutturazioni, rifacimenti decorativi con vinili di rivestimento e texture.\n• Scuole & uffici: vinili, pellicole solari, pittogrammi, segnaletica e molto altro.\n\nCatalogo generale: https://drive.google.com/file/d/14os32vAe747lEStnwy8Zl7tlyFU6kLLb/view?usp=sharing\nCatalogo rinnovo hotel e ristoranti: https://drive.google.com/file/d/1uf2VsEVLg7G-yjJqi4S8ttHmtrXgyRIa/view?usp=drive_link\n\nSe questo si adatta a qualche esigenza, propongo una chiamata di 10–15 minuti. Il nostro obiettivo è diventare un partner di fiducia per la vostra azienda.\n\nResto a disposizione. Grazie per il vostro tempo,\n\nNico\nNicolas Benitez — Business Development\nUnical Graphic · nico@unical.es'
  },
  {
    id: 'template_nl',
    name: 'Algemene Presentatie - Nederlands',
    subject: '360° Partner voor beurzen, congressen en evenementen in Spanje',
    body: 'Goedemorgen,\n\nMijn naam is Nicolas Benitez, verantwoordelijk voor bedrijfsontwikkeling bij Unical Graphic. Wij willen onszelf graag voorstellen als 360°-partner voor reclame-/marketingbureaus die een team nodig hebben voor ontwerp, productie en installatie bij beurzen, congressen, evenementen, binnen- en buitendecoratie, huisstijl en wagenpark-branding — met dekking in het gehele Spaanse grondgebied en EU-landen.\n\nWat wij doen:\n• Organisatie van beurzen en congressen: photocalls, rigide displays, banieren, textiel, vinyl, uitgelicht schrift.\n• Productie: digitaal drukwerk in groot formaat (spandoeken, vinyl, textiel, rigide materialen), POS/displays, totems, branding-elementen en maatwerk.\n• Franchise-branding: huisstijl, interieur- en exterieurontwerp.\n• Stands: modulair en op maat, van concept tot sleutelklare oplevering.\n• Integrale bewegwijzering: richtingwijzers, accreditaties, veiligheid en locatie-inrichting.\n• Voertuig- en wagenpark-branding (voor merkactivaties en merkenlogistiek).\n• Interieurinrichting/huisstijl voor tijdelijke of permanente ruimtes.\n• Kantoorinrichting (binnen en buiten).\n• Hospitality & Restaurants: renovaties, decoratieve verbouwingen met bedekkende vinyl en texturen.\n• Scholen & kantoren: vinyl, zonwerende folie, pictogrammen, bewegwijzering en nog veel meer.\n\nAlgemene catalogus: https://drive.google.com/file/d/14os32vAe747lEStnwy8Zl7tlyFU6kLLb/view?usp=sharing\nCatalogus renovatie hotels en restaurants: https://drive.google.com/file/d/1uf2VsEVLg7G-yjJqi4S8ttHmtrXgyRIa/view?usp=drive_link\n\nAls dit aansluit bij een behoefte van u, stel ik voor een gesprek van 10–15 minuten te plannen. Ons doel is een vertrouwde partner te worden voor uw bedrijf.\n\nIk kijk uit naar uw reactie. Bedankt voor uw tijd,\n\nNico\nNicolas Benitez — Business Development\nUnical Graphic · nico@unical.es'
  }
];

export default function B2BCRM() {
  const [prospects, setProspects] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState('');
  const [autoSendEmails, setAutoSendEmails] = useState(false);
  const [autoSendStats, setAutoSendStats] = useState({ sent: 0, failed: 0 });
  const [notification, setNotification] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'leadScore', direction: 'desc' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [emailTemplates, setEmailTemplates] = useState(DEFAULT_TEMPLATES);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedProspects, setSelectedProspects] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSent, setEmailSent] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSubject, setNewTemplateSubject] = useState('');
  const [newTemplateBody, setNewTemplateBody] = useState('');
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('b2b_prospects');
    if (saved) {
      // Sanea prospects antiguos que puedan no tener todos los campos.
      // Sin esto, acceder a .toLocaleString() sobre undefined crashea el Pipeline.
      const parsed = JSON.parse(saved).map(p => ({
        ...p,
        dealValue: typeof p.dealValue === 'number' ? p.dealValue : 5000,
        probability: typeof p.probability === 'number' ? p.probability : 10,
        leadScore: typeof p.leadScore === 'number' ? p.leadScore : 0,
        stage: p.stage || 'lead',
        email: p.email || '',
        company: p.company || 'Sin nombre',
        country: p.country || '',
        sector: p.sector || ''
      }));
      setProspects(parsed);
    }
    const savedTemplates = localStorage.getItem('email_templates');
    if (savedTemplates) {
      setEmailTemplates(JSON.parse(savedTemplates));
    }
    const savedSent = localStorage.getItem('email_sent');
    if (savedSent) {
      setEmailSent(JSON.parse(savedSent));
    }
    const savedReminders = localStorage.getItem('reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    }
    const savedActivities = localStorage.getItem('activities');
    if (savedActivities) {
      setActivities(JSON.parse(savedActivities));
    }
    const savedSearchHistory = localStorage.getItem('search_history');
    if (savedSearchHistory) {
      setSearchHistory(JSON.parse(savedSearchHistory));
    }
  }, []);

  useEffect(() => {
    if (prospects.length > 0) {
      localStorage.setItem('b2b_prospects', JSON.stringify(prospects));
    }
  }, [prospects]);

  useEffect(() => {
    if (emailTemplates.length > 0) {
      localStorage.setItem('email_templates', JSON.stringify(emailTemplates));
    }
  }, [emailTemplates]);

  useEffect(() => {
    if (emailSent.length > 0) {
      localStorage.setItem('email_sent', JSON.stringify(emailSent));
    }
  }, [emailSent]);

  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem('reminders', JSON.stringify(reminders));
    }
  }, [reminders]);

  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem('activities', JSON.stringify(activities));
    }
  }, [activities]);

  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('search_history', JSON.stringify(searchHistory));
    }
  }, [searchHistory]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const isBlockedEmail = (email) => {
    return email && email.toLowerCase().trim() === BLOCKED_EMAIL.toLowerCase();
  };

  const validateEmail = (email) => {
    if (!email) return false;
    if (isBlockedEmail(email)) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const calculateLeadScore = (prospect) => {
    let score = 0;
    
    // Sector scoring
    score += LEAD_SCORE_CRITERIA.sector[prospect.sector] || 10;
    
    // Country scoring
    score += LEAD_SCORE_CRITERIA.country[prospect.country] || 10;
    
    // Events per year
    if (prospect.eventsPerYear) {
      score += LEAD_SCORE_CRITERIA.eventsPerYear[prospect.eventsPerYear] || 0;
    }
    
    // Company size
    if (prospect.companySize) {
      score += LEAD_SCORE_CRITERIA.companySize[prospect.companySize] || 0;
    }
    
    // Email engagement
    if (prospect.emailOpened) score += 15;
    if (prospect.emailReplied) score += 25;
    
    return Math.min(score, 100);
  };

  const getLeadTier = (score) => {
    if (score >= 70) return { label: 'HOT', color: 'bg-red-500 text-white', icon: '🔥' };
    if (score >= 50) return { label: 'WARM', color: 'bg-orange-500 text-white', icon: '⚡' };
    return { label: 'COLD', color: 'bg-gray-400 text-white', icon: '❄️' };
  };

  const addActivity = (prospectId, type, description) => {
    const activity = {
      id: Date.now() + Math.random(),
      prospectId,
      type,
      description,
      createdAt: new Date().toISOString()
    };
    setActivities(prev => [...prev, activity]);
  };

  const createReminder = (prospectId, message, daysFromNow) => {
    const reminder = {
      id: Date.now() + Math.random(),
      prospectId,
      message,
      dueDate: new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setReminders(prev => [...prev, reminder]);
  };

  const autoSendToProspect = async (prospect, templates) => {
    const templateId = COUNTRY_TEMPLATE_MAP[prospect.country] || 'template_es';
    const template = templates.find(t => t.id === templateId) || templates[0];
    if (!template) return false;

    const personalize = (text) => text
      .replace(/\{company\}/g, prospect.company)
      .replace(/\{email\}/g, prospect.email)
      .replace(/\{country\}/g, COUNTRIES.find(c => c.code === prospect.country)?.name || prospect.country)
      .replace(/\{sector\}/g, prospect.sector)
      .replace(/\{recentEvent\}/g, prospect.recentEvent || 'sus eventos')
      .replace(/\{decisionMaker\}/g, prospect.decisionMaker || 'equipo');

    const subject = personalize(template.subject);
    const body = personalize(template.body);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: prospect.email, subject, body })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setEmailSent(prev => [...prev, {
          id: Date.now() + Math.random(),
          prospectId: prospect.id,
          to: prospect.email,
          company: prospect.company,
          subject,
          body,
          from: 'nico@unical.es',
          sentAt: new Date().toISOString(),
          resendId: result.id,
          autoSent: true
        }]);
        setAutoSendStats(prev => ({ ...prev, sent: prev.sent + 1 }));
        // Recordatorio de seguimiento a 3 días
        createReminder(prospect.id, `Seguimiento auto-email → ${prospect.company}`, 3);
        addActivity(prospect.id, 'email_sent', `Email automático enviado (${template.name}): ${subject}`);
        return true;
      }
    } catch (e) {
      console.error('Auto-send error:', e);
    }
    setAutoSendStats(prev => ({ ...prev, failed: prev.failed + 1 }));
    return false;
  };

  const handleSearch = async () => {
    if (selectedCountries.length === 0 || selectedSectors.length === 0) {
      showNotification('Selecciona al menos un país y un sector', 'error');
      return;
    }

    setIsSearching(true);
    setAutoSendStats({ sent: 0, failed: 0 });
    setSearchProgress('Iniciando búsqueda intensiva con enriquecimiento de datos...');

    const searchStartTime = new Date().toISOString();
    const newSearchProspects = [];

    try {
      let foundProspects = 0;
      const MIN_COMPANIES_PER_CATEGORY = 30;
      const usedEmails = new Set(prospects.map(p => p.email.toLowerCase()));
      const usedCompanies = new Set(prospects.map(p => p.company.toLowerCase()));

      for (const country of selectedCountries) {
        for (const sector of selectedSectors) {
          let categoryProspects = 0;
          let searchRound = 1;
          const MAX_ROUNDS = 6;

          while (categoryProspects < MIN_COMPANIES_PER_CATEGORY && searchRound <= MAX_ROUNDS) {
            setSearchProgress(`${country.name} - ${sector}: ${categoryProspects}/${MIN_COMPANIES_PER_CATEGORY} (ronda ${searchRound}/${MAX_ROUNDS})`);

            const searchVariations = [
              `${sector} ${country.name} corporate events Spain email contact directory decision maker`,
              `${sector} companies ${country.name} organize events Barcelona Madrid Valencia contact info`,
              `${sector} ${country.name} MICE international events email list phone`,
              `professional ${sector} ${country.name} event management Spain CEO contact`,
              `${sector} agencies ${country.name} business events Spain email address LinkedIn`,
              `${sector} ${country.name} conference organizers Spain professional contact directory`
            ];

            const query = searchVariations[(searchRound - 1) % searchVariations.length];

            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4000,
                messages: [{
                  role: 'user',
                  content: `CRITICAL MISSION: Search exhaustively and find as many REAL companies as possible.

SEARCH QUERY: "${query}"

GOAL: Find 15-20 DIFFERENT real companies in "${sector}" from ${country.name} that organize corporate events in Spain.

ENRICHED DATA REQUIREMENTS:
1. NEVER include "${BLOCKED_EMAIL}"
2. Find REAL companies with verified websites
3. Professional email (sales@, events@, contact@, named contacts)
4. Try to extract: company size (employees), recent events organized, decision maker name
5. Each company MUST be unique

For EACH company, provide ALL available data:
{
  "company": "Exact Company Name",
  "email": "verified@email.com",
  "website": "https://fullwebsite.com",
  "linkedin": "https://linkedin.com/company/name",
  "phone": "+country-phone" (if found),
  "companySize": "small/medium/large" (estimate),
  "eventsPerYear": "1/2-5/5-10/10+" (estimate if visible),
  "recentEvent": "Name of recent event organized" (if found),
  "decisionMaker": "Name and title" (if found),
  "painPoint": "Any challenge mentioned" (if found)
}

Search sources:
- Company directories and databases
- Event industry listings
- Professional associations
- LinkedIn company pages
- Industry news/press releases
- Event organizer databases
- Conference websites

Return ONLY valid JSON array with 15-20 companies:
[...]

DO NOT return empty arrays. Search until you find real companies.`
                }],
                tools: [{
                  type: 'web_search_20250305',
                  name: 'web_search'
                }]
              })
            });

            const data = await response.json();
            let allText = '';
            if (data.content) {
              for (const block of data.content) {
                if (block.type === 'text') {
                  allText += block.text + '\n';
                }
              }
            }

            if (allText) {
              const jsonMatch = allText.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                try {
                  const results = JSON.parse(jsonMatch[0]);
                  
                  if (Array.isArray(results)) {
                    for (const result of results) {
                      if (!result.company || !result.email) continue;
                      if (isBlockedEmail(result.email)) continue;
                      if (!validateEmail(result.email)) continue;

                      const emailLower = result.email.toLowerCase();
                      const companyLower = result.company.toLowerCase();

                      if (usedEmails.has(emailLower)) continue;
                      if (usedCompanies.has(companyLower)) continue;

                      usedEmails.add(emailLower);
                      usedCompanies.add(companyLower);

                      const newProspect = {
                        id: Date.now() + Math.random(),
                        company: result.company.trim(),
                        country: country.code,
                        sector,
                        email: result.email.trim(),
                        website: result.website ? result.website.trim() : '',
                        linkedin: result.linkedin || '',
                        phone: result.phone || '',
                        companySize: result.companySize || 'medium',
                        eventsPerYear: result.eventsPerYear || '2-5',
                        recentEvent: result.recentEvent || '',
                        decisionMaker: result.decisionMaker || '',
                        painPoint: result.painPoint || '',
                        notes: '',
                        tags: [],
                        stage: 'lead',
                        dealValue: 5000,
                        probability: 10,
                        leadScore: 0,
                        emailOpened: false,
                        emailReplied: false,
                        lastContact: null,
                        nextFollowUp: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };

                      newProspect.leadScore = calculateLeadScore(newProspect);

                      setProspects(prev => [...prev, newProspect]);
                      newSearchProspects.push(newProspect);
                      foundProspects++;
                      categoryProspects++;

                      // Auto-envío de email si está activado
                      if (autoSendEmails) {
                        setSearchProgress(`Enviando email a ${newProspect.company}...`);
                        await autoSendToProspect(newProspect, emailTemplates);
                        setProspects(prev => prev.map(p =>
                          p.id === newProspect.id
                            ? { ...p, stage: 'contacted', lastContact: new Date().toISOString(), nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }
                            : p
                        ));
                      } else {
                        createReminder(newProspect.id, `Contactar a ${newProspect.company}`, 1);
                      }

                      addActivity(newProspect.id, 'created', `Lead creado desde búsqueda web`);
                    }
                  }
                } catch (e) {
                  console.error('Error parseando JSON:', e);
                }
              }
            }

            searchRound++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      setSearchProgress('');
      setIsSearching(false);
      
      if (foundProspects > 0) {
        const searchRecord = {
          id: Date.now(),
          countries: selectedCountries.map(c => c.code),
          sectors: selectedSectors,
          startTime: searchStartTime,
          endTime: new Date().toISOString(),
          prospects: newSearchProspects,
          total: foundProspects,
          autoSent: autoSendEmails ? autoSendStats.sent : 0
        };
        setSearchHistory(prev => [searchRecord, ...prev].slice(0, 20));
        if (autoSendEmails) {
          showNotification(`✅ ${foundProspects} leads encontrados · ${autoSendStats.sent} emails enviados automáticamente`);
        } else {
          showNotification(`✅ ¡${foundProspects} nuevos leads con datos enriquecidos!`);
        }
      } else {
        showNotification('⚠️ No se encontraron nuevos prospectos únicos.', 'error');
      }
      
    } catch (error) {
      setSearchProgress('');
      setIsSearching(false);
      showNotification('❌ Error: ' + error.message, 'error');
    }
  };

  const updateProspect = (id, updates) => {
    setProspects(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
        updated.leadScore = calculateLeadScore(updated);
        
        // Update probability based on stage
        const stage = PIPELINE_STAGES.find(s => s.value === updated.stage);
        if (stage) {
          updated.probability = stage.probability;
        }
        
        // Log activity if stage changed
        if (updates.stage && updates.stage !== p.stage) {
          addActivity(id, 'stage_change', `Movido a ${PIPELINE_STAGES.find(s => s.value === updates.stage)?.label}`);
          
          // Auto-create follow-up reminders
          if (updates.stage === 'contacted') {
            createReminder(id, `Seguimiento ${updated.company}`, 3);
          } else if (updates.stage === 'proposal_sent') {
            createReminder(id, `Revisar propuesta con ${updated.company}`, 7);
          }
        }
        
        return updated;
      }
      return p;
    }));
  };

  const deleteProspect = (id) => {
    setProspects(prev => prev.filter(p => p.id !== id));
    showNotification('Prospecto eliminado');
  };

  const getFilteredProspects = () => {
    return prospects.filter(p => {
      const matchesSearch = !searchTerm || 
        p.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.website.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || p.stage === filterStatus;
      const matchesCountry = filterCountry === 'all' || p.country === filterCountry;
      const matchesSector = filterSector === 'all' || p.sector === filterSector;

      return matchesSearch && matchesStatus && matchesCountry && matchesSector;
    });
  };

  const sortProspects = (prospects) => {
    const sorted = [...prospects];
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'updatedAt' || sortConfig.key === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleProspectSelection = (id) => {
    setSelectedProspects(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const allIds = filteredProspects.map(p => p.id);
    setSelectedProspects(allIds);
  };

  const deselectAll = () => {
    setSelectedProspects([]);
  };

  const openEmailModal = (templateId = null) => {
    if (selectedProspects.length === 0) {
      showNotification('Selecciona al menos un prospecto', 'error');
      return;
    }

    if (templateId) {
      const template = emailTemplates.find(t => t.id === templateId);
      setCurrentTemplate(template);
      setEmailSubject(template.subject);
      setEmailBody(template.body);
    } else {
      setCurrentTemplate(null);
      setEmailSubject('');
      setEmailBody('');
    }
    
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setCurrentTemplate(null);
    setEmailSubject('');
    setEmailBody('');
  };

  const personalizeEmail = (text, prospect) => {
    return text
      .replace(/\{company\}/g, prospect.company)
      .replace(/\{email\}/g, prospect.email)
      .replace(/\{country\}/g, COUNTRIES.find(c => c.code === prospect.country)?.name || prospect.country)
      .replace(/\{sector\}/g, prospect.sector)
      .replace(/\{recentEvent\}/g, prospect.recentEvent || 'sus eventos')
      .replace(/\{decisionMaker\}/g, prospect.decisionMaker || 'equipo');
  };

  const sendEmails = async () => {
    if (!emailSubject || !emailBody) {
      showNotification('Completa el asunto y el mensaje', 'error');
      return;
    }

    const recipientsData = selectedProspects.map(id => {
      const prospect = prospects.find(p => p.id === id);
      return {
        prospectId: id,
        to: prospect.email,
        company: prospect.company,
        subject: personalizeEmail(emailSubject, prospect),
        body: personalizeEmail(emailBody, prospect),
        sentAt: new Date().toISOString()
      };
    });

    showNotification(`Enviando ${recipientsData.length} email(s)...`);

    let sent = 0;
    let failed = 0;

    for (const data of recipientsData) {
      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: data.to,
            subject: data.subject,
            body: data.body
          })
        });

        const result = await res.json();

        if (res.ok && result.success) {
          sent++;
          setEmailSent(prev => [...prev, {
            id: Date.now() + Math.random(),
            ...data,
            from: 'nico@unical.es',
            resendId: result.id
          }]);
          updateProspect(data.prospectId, {
            stage: 'contacted',
            lastContact: new Date().toISOString(),
            nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          });
          addActivity(data.prospectId, 'email_sent', `Email enviado: ${data.subject}`);
        } else {
          failed++;
          console.error(`Error enviando a ${data.to}:`, result.error);
        }
      } catch (err) {
        failed++;
        console.error(`Error de red enviando a ${data.to}:`, err);
      }

      // Pausa entre envíos para respetar el rate limit de Resend
      if (recipientsData.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (failed === 0) {
      showNotification(`✅ ${sent} email(s) enviados correctamente desde nico@unical.es`);
    } else if (sent > 0) {
      showNotification(`⚠️ ${sent} enviados, ${failed} fallaron. Revisa la consola.`, 'error');
    } else {
      showNotification('❌ No se pudieron enviar los emails. Verifica la configuración de Resend.', 'error');
    }

    setTimeout(() => {
      closeEmailModal();
      deselectAll();
    }, 1500);
  };

  const exportToCSV = () => {
    const filtered = getFilteredProspects();

    if (filtered.length === 0) {
      showNotification('No hay prospectos para exportar', 'error');
      return;
    }

    const headers = [
      'Empresa', 'Email', 'Website', 'Teléfono', 'País', 'Sector',
      'Etapa', 'Lead Score', 'Valor Deal (€)', 'Decision Maker',
      'Eventos/Año', 'Tamaño Empresa', 'Evento Reciente', 'Pain Point', 'Notas', 'Fecha Creación'
    ];

    const rows = filtered
      .filter(p => p.email && !isBlockedEmail(p.email))
      .map(p => {
        const countryName = COUNTRIES.find(c => c.code === p.country)?.name || p.country;
        const stageName = PIPELINE_STAGES.find(s => s.value === p.stage)?.label || p.stage;
        const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
        return [
          escape(p.company),
          escape(p.email),
          escape(p.website),
          escape(p.phone),
          escape(countryName),
          escape(p.sector),
          escape(stageName),
          p.leadScore || 0,
          p.dealValue || 0,
          escape(p.decisionMaker),
          escape(p.eventsPerYear),
          escape(p.companySize),
          escape(p.recentEvent),
          escape(p.painPoint),
          escape(p.notes),
          escape(p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-ES') : '')
        ].join(',');
      });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prospectos_unical_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification(`✅ ${filtered.length} prospectos exportados (CSV completo)`);
  };

  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setNewTemplateName(template.name);
      setNewTemplateSubject(template.subject);
      setNewTemplateBody(template.body);
    } else {
      setEditingTemplate(null);
      setNewTemplateName('');
      setNewTemplateSubject('');
      setNewTemplateBody('');
    }
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const saveTemplate = () => {
    if (!newTemplateName || !newTemplateSubject || !newTemplateBody) {
      showNotification('Completa todos los campos', 'error');
      return;
    }

    if (editingTemplate) {
      setEmailTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id
          ? { ...t, name: newTemplateName, subject: newTemplateSubject, body: newTemplateBody }
          : t
      ));
      showNotification('✅ Plantilla actualizada');
    } else {
      const newTemplate = {
        id: 'template_' + Date.now(),
        name: newTemplateName,
        subject: newTemplateSubject,
        body: newTemplateBody
      };
      setEmailTemplates(prev => [...prev, newTemplate]);
      showNotification('✅ Plantilla creada');
    }

    closeTemplateModal();
  };

  const deleteTemplate = (templateId) => {
    if (window.confirm('¿Eliminar plantilla?')) {
      setEmailTemplates(prev => prev.filter(t => t.id !== templateId));
      showNotification('Plantilla eliminada');
    }
  };

  const openProspectModal = (prospect = null) => {
    setEditingProspect(prospect);
    setShowProspectModal(true);
  };

  const closeProspectModal = () => {
    setShowProspectModal(false);
    setEditingProspect(null);
  };

  const downloadSearchResults = (searchRecord) => {
    if (!searchRecord || !searchRecord.prospects || searchRecord.prospects.length === 0) {
      showNotification('No hay resultados para descargar', 'error');
      return;
    }

    const headers = [
      'Empresa', 'Email', 'Website', 'Teléfono', 'País', 'Sector',
      'Lead Score', 'Valor Deal (€)', 'Decision Maker', 'Eventos/Año', 'Tamaño Empresa'
    ];

    const rows = searchRecord.prospects
      .filter(p => p.email && !isBlockedEmail(p.email))
      .map(p => {
        const countryName = COUNTRIES.find(c => c.code === p.country)?.name || p.country;
        const escape = (val) => `"${String(val || '').replace(/"/g, '""')}"`;
        return [
          escape(p.company),
          escape(p.email),
          escape(p.website),
          escape(p.phone),
          escape(countryName),
          escape(p.sector),
          p.leadScore || 0,
          p.dealValue || 0,
          escape(p.decisionMaker),
          escape(p.eventsPerYear),
          escape(p.companySize)
        ].join(',');
      });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date(searchRecord.startTime).toISOString().split('T')[0];
    const countriesStr = (searchRecord.countries || []).join('-');
    a.download = `busqueda_${countriesStr}_${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification(`✅ ${searchRecord.prospects.length} prospectos exportados`);
  };

  const deleteSearchHistory = (searchId) => {
    if (window.confirm('¿Eliminar este historial de búsqueda?')) {
      setSearchHistory(prev => prev.filter(s => s.id !== searchId));
      showNotification('Historial eliminado');
    }
  };

  const completeReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: true } : r));
  };

  const filteredProspects = sortProspects(getFilteredProspects());

  const stats = {
    totalLeads: prospects.length,
    hotLeads: prospects.filter(p => calculateLeadScore(p) >= 70).length,
    warmLeads: prospects.filter(p => {
      const score = calculateLeadScore(p);
      return score >= 50 && score < 70;
    }).length,
    pipelineValue: prospects.reduce((sum, p) => sum + ((p.dealValue || 0) * (p.probability || 0) / 100), 0),
    avgDealSize: prospects.length > 0 ? prospects.reduce((sum, p) => sum + (p.dealValue || 0), 0) / prospects.length : 0,
    conversionRate: prospects.filter(p => p.stage === 'won').length / Math.max(prospects.filter(p => p.stage === 'contacted').length, 1) * 100,
    wonDeals: prospects.filter(p => p.stage === 'won').length,
    totalRevenue: prospects.filter(p => p.stage === 'won').reduce((sum, p) => sum + (p.dealValue || 0), 0),
    byStage: PIPELINE_STAGES.map(stage => ({
      stage: stage.label,
      count: prospects.filter(p => p.stage === stage.value).length,
      value: prospects.filter(p => p.stage === stage.value).reduce((sum, p) => sum + ((p.dealValue || 0) * (p.probability || 0) / 100), 0)
    })),
    byCountry: COUNTRIES.map(c => ({
      country: c.name,
      count: prospects.filter(p => p.country === c.code).length,
      value: prospects.filter(p => p.country === c.code).reduce((sum, p) => sum + ((p.dealValue || 0) * (p.probability || 0) / 100), 0)
    })),
    emailsSent: emailSent.length,
    emailsThisWeek: emailSent.filter(e => {
      const sentDate = new Date(e.sentAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return sentDate > weekAgo;
    }).length,
    pendingReminders: reminders.filter(r => !r.completed && new Date(r.dueDate) <= new Date()).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                🎯 CRM B2B - Unical Graphic
              </h1>
              <p className="text-gray-600">
                Sistema completo de ventas para eventos corporativos
              </p>
            </div>
            {stats.pendingReminders > 0 && (
              <div className="bg-red-100 border border-red-300 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-semibold">{stats.pendingReminders} recordatorios pendientes</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'search' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔍 Nueva Búsqueda
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-6 py-4 font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === 'pipeline' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🎯 Pipeline
              {prospects.length > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === 'pipeline' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                }`}>
                  {prospects.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-6 py-4 font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === 'campaigns' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              📧 Campañas
              {emailSent.length > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === 'campaigns' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                }`}>
                  {emailSent.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-6 py-4 font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === 'reminders' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🔔 Recordatorios
              {stats.pendingReminders > 0 && (
                <span className="ml-2 px-2 py-1 rounded-full text-xs bg-red-500 text-white">
                  {stats.pendingReminders}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-semibold transition-colors relative whitespace-nowrap ${
                activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              📜 Historial Búsquedas
              {searchHistory.length > 0 && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  activeTab === 'history' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-800'
                }`}>
                  {searchHistory.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Dashboard Ejecutivo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Pipeline Value</h3>
                    <DollarSign className="w-5 h-5 opacity-75" />
                  </div>
                  <p className="text-3xl font-bold">€{Math.round(stats.pipelineValue).toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-1">Valor ponderado total</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Hot Leads</h3>
                    <Target className="w-5 h-5 opacity-75" />
                  </div>
                  <p className="text-3xl font-bold">{stats.hotLeads}</p>
                  <p className="text-xs opacity-75 mt-1">Score ≥ 70 puntos</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Conversion Rate</h3>
                    <TrendingUp className="w-5 h-5 opacity-75" />
                  </div>
                  <p className="text-3xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
                  <p className="text-xs opacity-75 mt-1">Contactado → Ganado</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold opacity-90">Revenue</h3>
                    <Award className="w-5 h-5 opacity-75" />
                  </div>
                  <p className="text-3xl font-bold">€{Math.round(stats.totalRevenue).toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-1">{stats.wonDeals} deals cerrados</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Pipeline por Etapa</h3>
                  <div className="space-y-3">
                    {stats.byStage.map(item => (
                      item.count > 0 && (
                        <div key={item.stage} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.stage}</span>
                              <span className="text-sm text-gray-600">{item.count} leads</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${(item.count / stats.totalLeads) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-semibold text-gray-800">
                            €{Math.round(item.value).toLocaleString()}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance por País</h3>
                  <div className="space-y-3">
                    {stats.byCountry.map(item => (
                      item.count > 0 && (
                        <div key={item.country} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.country}</span>
                              <span className="text-sm text-gray-600">{item.count} leads</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${(item.count / stats.totalLeads) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="ml-4 text-sm font-semibold text-gray-800">
                            €{Math.round(item.value).toLocaleString()}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-8 h-8 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-600">Emails esta semana</p>
                      <p className="text-2xl font-bold text-indigo-600">{stats.emailsThisWeek}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-pink-600" />
                    <div>
                      <p className="text-sm text-gray-600">Deal promedio</p>
                      <p className="text-2xl font-bold text-pink-600">€{Math.round(stats.avgDealSize).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Warm Leads</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.warmLeads}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Nueva Búsqueda con Enriquecimiento</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Países</label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map(country => (
                    <button
                      key={country.code}
                      onClick={() => {
                        setSelectedCountries(prev => 
                          prev.find(c => c.code === country.code)
                            ? prev.filter(c => c.code !== country.code)
                            : [...prev, country]
                        );
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedCountries.find(c => c.code === country.code)
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {country.flag} {country.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sectores</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {SECTORS.map(sector => (
                    <label key={sector} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSectors.includes(sector)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSectors(prev => [...prev, sector]);
                          } else {
                            setSelectedSectors(prev => prev.filter(s => s !== sector));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{sector}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggle auto-envío */}
              <div className={`mb-4 rounded-xl border-2 p-4 transition-all ${autoSendEmails ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Send className={`w-5 h-5 ${autoSendEmails ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`font-semibold ${autoSendEmails ? 'text-green-800' : 'text-gray-700'}`}>
                        Envío automático de emails
                      </span>
                      {autoSendEmails && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-bold animate-pulse">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 ml-7">
                      {autoSendEmails
                        ? 'Cada lead encontrado recibirá el email en su idioma automáticamente. Se crearán recordatorios de seguimiento a 3 días.'
                        : 'Activa para enviar el email de presentación automáticamente a cada lead encontrado, en su idioma.'}
                    </p>
                    {autoSendEmails && (
                      <div className="ml-7 mt-2 flex gap-3 text-xs font-medium">
                        <span className="text-gray-500">Idiomas activos:</span>
                        <span className="text-blue-600">🇬🇧🇺🇸 EN · 🇩🇪🇨🇭 DE · 🇫🇷 FR · 🇮🇹 IT · 🇳🇱🇧🇪 NL · 🇪🇸🇵🇹 ES</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setAutoSendEmails(v => !v)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ml-4 shrink-0 ${autoSendEmails ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${autoSendEmails ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSearch}
                disabled={isSearching || selectedCountries.length === 0 || selectedSectors.length === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {isSearching ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {searchProgress}
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Search className="w-5 h-5 mr-2" />
                    {autoSendEmails ? 'Buscar y enviar emails automáticamente' : 'Buscar 30+ leads con datos enriquecidos'}
                  </span>
                )}
              </button>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Pipeline de Ventas ({filteredProspects.length} leads)</h2>
                <div className="flex gap-3">
                  {selectedProspects.length > 0 && (
                    <>
                      <button
                        onClick={() => openEmailModal()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center shadow-md"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Email ({selectedProspects.length})
                      </button>
                      <button
                        onClick={deselectAll}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Deseleccionar
                      </button>
                    </>
                  )}
              <button
                onClick={exportToCSV}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center shadow-md"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            </div>
          </div>

          {selectedProspects.length === 0 && filteredProspects.length > 0 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Selecciona leads para campañas masivas
                <button onClick={selectAllFiltered} className="ml-3 text-blue-600 underline font-semibold">
                  Seleccionar todos ({filteredProspects.length})
                </button>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Empresa, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Todos</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Sector</label>
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Todos</option>
                {SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Etapa</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">Todas</option>
                {PIPELINE_STAGES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ordenar</label>
              <select
                value={sortConfig.key}
                onChange={(e) => handleSort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="leadScore">Score</option>
                <option value="dealValue">Valor</option>
                <option value="updatedAt">Actualizado</option>
                <option value="company">Empresa</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProspects.length === filteredProspects.length && filteredProspects.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            selectAllFiltered();
                          } else {
                            deselectAll();
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Empresa</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contacto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Etapa</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProspects.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                        {prospects.length === 0 
                          ? 'No hay leads. Ve a Nueva Búsqueda para empezar.'
                          : 'No hay leads que coincidan con los filtros.'}
                      </td>
                    </tr>
                  ) : (
                    filteredProspects.map(prospect => {
                      const tier = getLeadTier(prospect.leadScore);
                      return (
                        <tr key={prospect.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedProspects.includes(prospect.id)}
                              onChange={() => toggleProspectSelection(prospect.id)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${tier.color}`}>
                                {tier.icon} {prospect.leadScore}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{prospect.company}</div>
                            <div className="text-xs text-gray-500">
                              {COUNTRIES.find(c => c.code === prospect.country)?.flag} {prospect.sector}
                            </div>
                            {prospect.decisionMaker && (
                              <div className="text-xs text-blue-600 mt-1">👤 {prospect.decisionMaker}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                <a href={`mailto:${prospect.email}`} className="text-blue-600 hover:underline">
                                  {prospect.email}
                                </a>
                              </div>
                              {prospect.phone && (
                                <div className="flex items-center text-sm">
                                  <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                  <span className="text-gray-600">{prospect.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={prospect.stage}
                              onChange={(e) => updateProspect(prospect.id, { stage: e.target.value })}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                PIPELINE_STAGES.find(s => s.value === prospect.stage)?.color
                              }`}
                            >
                              {PIPELINE_STAGES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                            <div className="text-xs text-gray-500 mt-1">{prospect.probability || 0}% prob.</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">€{(prospect.dealValue || 0).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">
                              Pond: €{Math.round((prospect.dealValue || 0) * (prospect.probability || 0) / 100).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openProspectModal(prospect)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProspect(prospect.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

          {activeTab === 'campaigns' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Campañas de Email</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Total Enviados</h3>
                  <p className="text-4xl font-bold text-blue-600">{emailSent.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Esta Semana</h3>
                  <p className="text-4xl font-bold text-green-600">{stats.emailsThisWeek}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Plantillas</h3>
                  <p className="text-4xl font-bold text-purple-600">{emailTemplates.length}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">📝 Plantillas</h3>
                  <button
                    onClick={() => openTemplateModal()}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Plantilla
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {emailTemplates.map(template => (
                    <div key={template.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                      <h4 className="font-semibold text-gray-800 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.subject}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            if (selectedProspects.length === 0) {
                              showNotification('Selecciona leads en Pipeline primero', 'error');
                              setActiveTab('pipeline');
                            } else {
                              openEmailModal(template.id);
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center justify-center"
                        >
                          <Send className="w-3 h-3 mr-1" />
                          Usar
                        </button>
                        <button
                          onClick={() => openTemplateModal(template)}
                          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">📨 Historial</h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Empresa</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Para</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Asunto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {emailSent.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                              No se han enviado emails.
                            </td>
                          </tr>
                        ) : (
                          [...emailSent].reverse().slice(0, 50).map(email => (
                            <tr key={email.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(email.sentAt).toLocaleString('es-ES')}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {email.company}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {email.to}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-800">
                                {email.subject}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

{activeTab === 'reminders' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Recordatorios y Seguimiento</h2>

              <div className="space-y-4">
                {reminders.filter(r => !r.completed).length === 0 ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                    <Award className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      ¡Todo al día! 🎉
                    </h3>
                    <p className="text-green-700">
                      No tienes recordatorios pendientes.
                    </p>
                  </div>
                ) : (
                  reminders
                    .filter(r => !r.completed)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map(reminder => {
                      const prospect = prospects.find(p => p.id === reminder.prospectId);
                      const isOverdue = new Date(reminder.dueDate) < new Date();
                      
                      return (
                        <div
                          key={reminder.id}
                          className={`border-2 rounded-lg p-4 ${
                            isOverdue ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Bell className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-yellow-600'}`} />
                                <h4 className={`font-semibold ${isOverdue ? 'text-red-800' : 'text-yellow-800'}`}>
                                  {reminder.message}
                                </h4>
                              </div>
                              
                              {prospect && (
                                <div className="ml-7 mb-2">
                                  <p className="text-sm text-gray-700">
                                    <strong>{prospect.company}</strong> - {prospect.email}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Etapa: {PIPELINE_STAGES.find(s => s.value === prospect.stage)?.label} | 
                                    Score: {prospect.leadScore || 0} | 
                                    Valor: €{(prospect.dealValue || 0).toLocaleString()}
                                  </p>
                                </div>
                              )}
                              
                              <div className="ml-7">
                                <p className={`text-sm font-medium ${
                                  isOverdue ? 'text-red-700' : 'text-yellow-700'
                                }`}>
                                  {isOverdue ? '⚠️ Vencido: ' : '📅 Fecha: '}
                                  {new Date(reminder.dueDate).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {prospect && (
                                <button
                                  onClick={() => {
                                    setSelectedProspects([prospect.id]);
                                    openEmailModal();
                                  }}
                                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                >
                                  <Send className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => completeReminder(reminder.id)}
                                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                              >
                                ✓ Completar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {reminders.filter(r => r.completed).length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-600">Completados</h3>
                  <div className="space-y-2">
                    {reminders
                      .filter(r => r.completed)
                      .slice(0, 10)
                      .map(reminder => {
                        const prospect = prospects.find(p => p.id === reminder.prospectId);
                        return (
                          <div key={reminder.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 opacity-60">
                            <p className="text-sm text-gray-700">
                              ✓ {reminder.message}
                              {prospect && ` - ${prospect.company}`}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Historial de Búsquedas</h2>
              {searchHistory.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No hay búsquedas registradas</p>
                  <p className="text-sm mt-1">Las próximas búsquedas aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map(record => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-300 transition-colors bg-white">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-sm font-semibold text-gray-800">
                              {new Date(record.startTime).toLocaleString('es-ES')}
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                              {record.total} leads
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {(record.countries || []).map(code => {
                              const country = COUNTRIES.find(c => c.code === code);
                              return country ? (
                                <span key={code} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                  {country.flag} {country.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(record.sectors || []).map(sector => (
                              <span key={sector} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {sector}
                              </span>
                            ))}
                          </div>
                          {record.prospects && record.prospects.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-2">Empresas encontradas:</p>
                              <div className="flex flex-wrap gap-1">
                                {record.prospects.slice(0, 8).map((p, i) => (
                                  <span key={i} className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded px-2 py-1">
                                    {p.company}
                                  </span>
                                ))}
                                {record.prospects.length > 8 && (
                                  <span className="text-xs text-gray-400 px-2 py-1">+{record.prospects.length - 8} más</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {record.prospects && record.prospects.length > 0 && (
                            <button
                              onClick={() => downloadSearchResults(record)}
                              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center gap-1 whitespace-nowrap"
                            >
                              <Download className="w-4 h-4" />
                              Exportar CSV
                            </button>
                          )}
                          <button
                            onClick={() => deleteSearchHistory(record.id)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1 justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Enviar Email</h2>
                    <p className="text-blue-100 mt-1">{selectedProspects.length} destinatario(s)</p>
                  </div>
                  <button onClick={closeEmailModal} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {!currentTemplate && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Plantilla</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {emailTemplates.map(template => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setCurrentTemplate(template);
                            setEmailSubject(template.subject);
                            setEmailBody(template.body);
                          }}
                          className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors text-left"
                        >
                          <div className="font-semibold text-sm text-gray-800">{template.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Asunto</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Asunto del email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mensaje</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="Contenido del email"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeEmailModal}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={sendEmails}
                    disabled={!emailSubject || !emailBody}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </h2>
                  <button onClick={closeTemplateModal} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Nombre de la plantilla"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Asunto</label>
                  <input
                    type="text"
                    value={newTemplateSubject}
                    onChange={(e) => setNewTemplateSubject(e.target.value)}
                    placeholder="Asunto del email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cuerpo</label>
                  <textarea
                    value={newTemplateBody}
                    onChange={(e) => setNewTemplateBody(e.target.value)}
                    rows={14}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                    placeholder="Contenido de la plantilla"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeTemplateModal}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveTemplate}
                    disabled={!newTemplateName || !newTemplateSubject || !newTemplateBody}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingTemplate ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showProspectModal && editingProspect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Editar Lead</h2>
                  <button onClick={closeProspectModal} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor Deal (€)</label>
                    <input
                      type="number"
                      value={editingProspect.dealValue}
                      onChange={(e) => setEditingProspect({...editingProspect, dealValue: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Eventos/Año</label>
                    <select
                      value={editingProspect.eventsPerYear}
                      onChange={(e) => setEditingProspect({...editingProspect, eventsPerYear: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="1">1</option>
                      <option value="2-5">2-5</option>
                      <option value="5-10">5-10</option>
                      <option value="10+">10+</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tamaño Empresa</label>
                  <select
                    value={editingProspect.companySize}
                    onChange={(e) => setEditingProspect({...editingProspect, companySize: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="small">Pequeña (1-50)</option>
                    <option value="medium">Mediana (51-250)</option>
                    <option value="large">Grande (250+)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notas</label>
                  <textarea
                    value={editingProspect.notes}
                    onChange={(e) => setEditingProspect({...editingProspect, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Notas internas..."
                  />
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Datos Enriquecidos</h4>
                  {editingProspect.decisionMaker && (
                    <p className="text-sm text-gray-700 mb-1">👤 <strong>Decision Maker:</strong> {editingProspect.decisionMaker}</p>
                  )}
                  {editingProspect.recentEvent && (
                    <p className="text-sm text-gray-700 mb-1">🎪 <strong>Evento reciente:</strong> {editingProspect.recentEvent}</p>
                  )}
                  {editingProspect.painPoint && (
                    <p className="text-sm text-gray-700">💡 <strong>Pain Point:</strong> {editingProspect.painPoint}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeProspectModal}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      updateProspect(editingProspect.id, editingProspect);
                      closeProspectModal();
                      showNotification('Lead actualizado correctamente');
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>🔒 CRM B2B Profesional - Datos en localStorage</p>
        </div>
      </div>
    </div>
  );
}