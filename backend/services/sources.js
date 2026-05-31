// ─── Job source registry ────────────────────────────────────────────
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
const TIMEOUT = 15000;

async function fetchText(url, opts = {}) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA, ...opts.headers },
    signal: AbortSignal.timeout(opts.timeout || TIMEOUT),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.text();
}

async function fetchJSON(url, opts = {}) {
  const resp = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json', ...opts.headers },
    signal: AbortSignal.timeout(opts.timeout || TIMEOUT),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`);
  return resp.json();
}

// ─── Generic RSS/Atom parser ─────────────────────────────────────────
function parseRSS(xml) {
  const items = [];
  const entries = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const e of entries) {
    const title = (e.match(/<title><!\[CDATA\[([^\]]+)\]\]><\/title>/) || e.match(/<title>([^<]+)<\/title>/) || [])[1] || '';
    const desc = (e.match(/<description><!\[CDATA\[([^\]]+)\]\]><\/description>/) || e.match(/<description>([^<]+)<\/description>/) || [])[1] || '';
    const link = (e.match(/<link>([^<]+)<\/link>/) || [])[1] || '';
    const pubDate = (e.match(/<pubDate>([^<]+)<\/pubDate>/) || [])[1] || null;
    items.push({ title: title.trim(), description: desc.replace(/<[^>]+>/g, ' ').trim(), url: link.trim(), postedAt: pubDate });
  }
  // Atom format
  if (!items.length) {
    const atomEntries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    for (const e of atomEntries) {
      const title = (e.match(/<title[^>]*>([^<]+)<\/title>/) || [])[1] || '';
      const link = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1] || '';
      const published = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || null;
      const content = (e.match(/<content[^>]*>([\s\S]*?)<\/content>/) || [])[1] || '';
      items.push({ title: title.trim(), description: content.replace(/<[^>]+>/g, ' ').trim(), url: link.trim(), postedAt: published });
    }
  }
  return items;
}

// ─── Generic HTML parser ─────────────────────────────────────────────
function extractHTMLItems(html, pattern) {
  const items = [];
  const blocks = html.match(new RegExp(pattern.block || pattern, 'gi')) || [];
  for (const b of blocks) {
    const title = (b.match(new RegExp(pattern.title || '>([^<]{3,100})<', 'i')) || [])[1];
    if (!title || title.length < 3) continue;
    const link = (b.match(new RegExp(pattern.link || 'href="([^"]+)"', 'i')) || [])[1] || '';
    items.push({
      title: title.trim().replace(/\s+/g, ' '),
      company: '',
      location: '',
      salaryMin: null,
      salaryMax: null,
      currency: 'PLN',
      description: '',
      url: link.startsWith('http') ? link : (link ? 'https://' + pattern.domain + link : ''),
      postedAt: null,
    });
  }
  return items;
}

// ─── Source definitions ──────────────────────────────────────────────
const SOURCES = [];

function register(name, url, type, popularity, region, description, scraper) {
  SOURCES.push({ name, url, type, popularity, region, description, scraper });
}

// ═══════════════════════════════════════════════════════════════════════
// TIER 1 – Direct APIs (most reliable, richest data)
// ═══════════════════════════════════════════════════════════════════════

register('nofluffjobs', 'https://nofluffjobs.com/api/posting?page=1&pageSize=200', 'api', 8, 'pl',
  'Polski portal pracy z transparentnymi widełkami',
  async () => {
    const data = await fetchJSON('https://nofluffjobs.com/api/posting?page=1&pageSize=200', {
      timeout: 60000,
      headers: { Referer: 'https://nofluffjobs.com/' },
    });
    const items = data.postings || [];
    const out = [];
    for (const p of items) {
      const place = p.location?.places?.[0] || {};
      const salary = p.salary || {};
      out.push({
        title: p.title || '',
        company: p.name || '',
        location: place.city || '',
        salaryMin: salary.from || null,
        salaryMax: salary.to || null,
        currency: salary.currency || 'PLN',
        description: (p.tiles?.values || []).map(t => t.value).join(', '),
        url: `https://nofluffjobs.com/pl/job/${p.url || p.id}`,
        postedAt: p.posted ? new Date(p.posted).toISOString() : null,
      });
      if (out.length >= 200) break;
    }
    return out;
  },
);

register('solid.jobs', 'https://solid.jobs/offers', 'api', 8, 'pl',
  'Polski portal IT z jawnymi widełkami, Angular SSR',
  async () => {
    const html = await fetchText('https://solid.jobs/offers', { timeout: 30000 });
    const match = html.match(/id="ng-state"[^>]*>\s*({.+?})\s*<\//);
    if (!match) return [];
    const data = JSON.parse(match[1]);
    const offers = [];
    for (const v of Object.values(data)) {
      const items = v?.b;
      if (Array.isArray(items)) {
        for (const o of items) {
          const sr = o.salaryRange || {};
          const skills = (o.requiredSkills || []).map(s => s.name).join(', ');
          offers.push({
            title: o.jobTitle || '',
            company: o.companyName || '',
            location: o.companyCity || '',
            salaryMin: sr.lowerBound || null,
            salaryMax: sr.upperBound || null,
            currency: sr.currency || 'PLN',
            description: skills,
            url: `https://solid.jobs/offer/${o.jobOfferKey || o.jobOfferUrl || o.id}`,
            postedAt: o.validFrom || null,
          });
        }
      }
    }
    return offers;
  },
);

// ═══════════════════════════════════════════════════════════════════════
// TIER 2 – Meta-aggregators (isitfair.pl)
// ═══════════════════════════════════════════════════════════════════════

function makeIsitfairScraper(sourceKey, sourceLabel) {
  return async () => {
    const all = [];
    for (let page = 1; page <= 10; page++) {
      try {
        const data = await fetchJSON(`https://isitfair.pl/api/v1/offers/search?offer_source=${sourceKey}&page=${page}&offer_status=active&per_page=20`);
        const items = data.data || [];
        if (!items.length) break;
        for (const o of items) {
          const salaryMin = o.offer_salary_min || null;
          const salaryMax = o.offer_salary_max || null;
          const interval = o.offer_salary_interval || 'monthly';
          all.push({
            title: o.offer_title || '',
            company: o.company?.company_name || o.company_name || '',
            location: o.offer_city || '',
            salaryMin: salaryMin !== null ? (interval === 'hourly' ? salaryMin * 168 : salaryMin) : null,
            salaryMax: salaryMax !== null ? (interval === 'hourly' ? salaryMax * 168 : salaryMax) : null,
            currency: o.offer_salary_currency || 'PLN',
            description: o.offer_category || '',
            url: o.offer_href || '',
            postedAt: o.offer_published_at || null,
          });
        }
        if (items.length < 20) break;
      } catch { break; }
    }
    return all;
  };
}

register('justjoin.it', 'https://isitfair.pl (justjoin.it)', 'api', 8, 'pl',
  'Popularny polski portal IT (via isitfair.pl)',
  makeIsitfairScraper('justjoin.it', 'justjoin.it'),
);

register('pracuj.pl', 'https://isitfair.pl (pracuj.pl)', 'api', 9, 'pl',
  'Największy polski portal pracy (via isitfair.pl)',
  makeIsitfairScraper('pracuj.pl', 'pracuj.pl'),
);

// ═══════════════════════════════════════════════════════════════════════
// TIER 3 – RSS/Atom feeds
// ═══════════════════════════════════════════════════════════════════════

function makeRSSScraper(feedUrl) {
  return async () => {
    const xml = await fetchText(feedUrl);
    return parseRSS(xml).map(item => ({
      title: item.title,
      company: '',
      location: '',
      salaryMin: null,
      salaryMax: null,
      currency: 'PLN',
      description: item.description,
      url: item.url,
      postedAt: item.postedAt,
    }));
  };
}

register('weworkremotely.com', 'https://weworkremotely.com/categories/remote-programming-jobs.rss', 'rss', 7, 'remote',
  'Globalny portal z zdalnymi ofertami IT', makeRSSScraper('https://weworkremotely.com/categories/remote-programming-jobs.rss'));

register('remoteok.com', 'https://remoteok.com/remote-devops-jobs.rss', 'rss', 7, 'remote',
  'Globalny portal z zdalnymi ofertami DevOps', makeRSSScraper('https://remoteok.com/remote-devops-jobs.rss'));

register('landing.jobs', 'https://landing.jobs/feed', 'rss', 7, 'remote',
  'Globalny portal pracy w tech (Atom feed)', makeRSSScraper('https://landing.jobs/feed'));

register('jobspresso.co', 'https://jobspresso.co/feed/', 'rss', 6, 'remote',
  'Portal z zdalnymi ofertami pracy', makeRSSScraper('https://jobspresso.co/feed/'));

register('remoteworkhub.com', 'https://remoteworkhub.com/feed', 'rss', 5, 'remote',
  'Agregator zdalnych ofert pracy', makeRSSScraper('https://remoteworkhub.com/feed'));

register('remotehub.io', 'https://remotehub.io/feed', 'rss', 4, 'remote',
  'Portal z zdalnymi ofertami (WordPress)', makeRSSScraper('https://remotehub.io/feed'));

register('workingnomads.co', 'https://www.workingnomads.co/jobs/feed', 'rss', 5, 'remote',
  'Portal z zdalnymi ofertami pracy', makeRSSScraper('https://www.workingnomads.co/jobs/feed'));

register('dice.com', 'https://www.dice.com/feed', 'rss', 6, 'int',
  'Amerykański portal IT (RSS)', makeRSSScraper('https://www.dice.com/feed'));

register('justremote.co', 'https://justremote.co/feed', 'rss', 5, 'remote',
  'Portal z zdalnymi ofertami pracy', makeRSSScraper('https://justremote.co/feed'));

register('remotefrontendjobs.com', 'https://www.remotefrontendjobs.com/feed', 'rss', 4, 'remote',
  'Portal z zdalnymi ofertami frontend', makeRSSScraper('https://www.remotefrontendjobs.com/feed'));

// ═══════════════════════════════════════════════════════════════════════
// TIER 3b – Free REST APIs (international)
// ═══════════════════════════════════════════════════════════════════════

register('arbeitnow.com', 'https://arbeitnow.com/api/job-board-api', 'api', 7, 'int',
  'Darmowe API z ofertami pracy z całego świata',
  async () => {
    const all = [];
    for (let p = 1; p <= 3; p++) {
      try {
        const d = await fetchJSON(`https://arbeitnow.com/api/job-board-api?page=${p}`);
        for (const j of (d.data || [])) {
          const ts = j.created_at;
          all.push({
            title: j.title || '',
            company: j.company_name || '',
            location: '',
            salaryMin: null, salaryMax: null, currency: 'PLN',
            description: (j.description || '').replace(/<[^>]+>/g, ' ').trim(),
            url: j.url || `https://arbeitnow.com/jobs/${j.slug}`,
            postedAt: ts ? new Date(ts * 1000).toISOString() : null,
          });
        }
        if (!d.data || d.data.length < 100) break;
      } catch { break; }
    }
    return all;
  });

register('jobicy.com', 'https://jobicy.com/api/v2/remote-jobs', 'api', 6, 'remote',
  'Darmowe API z zdalnymi ofertami pracy',
  async () => {
    const d = await fetchJSON('https://jobicy.com/api/v2/remote-jobs?count=50');
    return (d.jobs || []).map(j => ({
      title: j.jobTitle || '',
      company: j.companyName || '',
      location: j.jobGeo || '',
      salaryMin: j.annualSalaryMin || null,
      salaryMax: j.annualSalaryMax || null,
      currency: j.salaryCurrency || 'PLN',
      description: (j.jobDescription || '').replace(/<[^>]+>/g, ' ').trim(),
      url: j.url || `https://jobicy.com/jobs/${j.jobSlug}`,
      postedAt: j.pubDate || null,
    }));
  });

register('remotive.com', 'https://remotive.com/api/remote-jobs', 'api', 7, 'remote',
  'Darmowe API z zdalnymi ofertami pracy (kategoria software-dev)',
  async () => {
    const d = await fetchJSON('https://remotive.com/api/remote-jobs');
    return (d.jobs || []).map(j => ({
      title: j.title || '',
      company: j.company_name || '',
      location: j.candidate_required_location || '',
      salaryMin: j.salary_min || null,
      salaryMax: j.salary_max || null,
      currency: j.salary_currency || 'PLN',
      description: (j.description || '').replace(/<[^>]+>/g, ' ').trim(),
      url: j.url || '',
      postedAt: j.publication_date || null,
    }));
  });

register('himalayas.app', 'https://himalayas.app/jobs/api', 'api', 7, 'remote',
  'Darmowe API z 100k+ zdalnych ofert pracy',
  async () => {
    const all = [];
    for (let offset = 0; offset < 60; offset += 20) {
      try {
        const d = await fetchJSON(`https://himalayas.app/jobs/api?offset=${offset}&limit=20`);
        for (const j of (d.jobs || [])) {
          all.push({
            title: j.title || '',
            company: j.companyName || '',
            location: (j.locationRestrictions || []).join(', '),
            salaryMin: j.minSalary || null,
            salaryMax: j.maxSalary || null,
            currency: j.currency || 'PLN',
            description: ((j.excerpt || '') + ' ' + (j.description || '')).replace(/<[^>]+>/g, ' ').trim(),
            url: j.guid || (j.applicationLink || ''),
            postedAt: j.pubDate || null,
          });
        }
        if (!d.jobs || d.jobs.length < 20) break;
      } catch { break; }
    }
    return all;
  });

register('jobtechdev.se', 'https://jobsearch.api.jobtechdev.se', 'api', 6, 'int',
  'Szwedzkie API publicznych ofert pracy (devops)',
  async () => {
    const d = await fetchJSON('https://jobsearch.api.jobtechdev.se/search?q=devops&offset=0&limit=100');
    return (d.hits || []).map(j => ({
      title: j.headline || '',
      company: j.employer?.name || '',
      location: j.workplace_address?.municipality || '',
      salaryMin: null, salaryMax: null, currency: 'PLN',
      description: j.description?.text?.slice(0, 1000) || '',
      url: j.webpage_url || '',
      postedAt: j.publication_date || null,
    }));
  });

register('infopraca.pl RSS', 'https://infopraca.pl/rss', 'rss', 5, 'pl',
  'RSS polskiego portalu ogłoszeń pracy',
  makeRSSScraper('https://infopraca.pl/rss'));

register('simplyhired.com', 'https://www.simplyhired.com/search?q=devops&l=poland&rss=1', 'rss', 6, 'int',
  'Amerykański agregator ofert pracy (RSS)',
  makeRSSScraper('https://www.simplyhired.com/search?q=devops&l=poland&rss=1'));

// ═══════════════════════════════════════════════════════════════════════
// TIER 4 – HTML-scraped Polish job boards
// ═══════════════════════════════════════════════════════════════════════

function makeHTMLScraper(pageUrl, pattern, domain) {
  return async () => {
    try {
      const html = await fetchText(pageUrl);
      return extractHTMLItems(html, { ...pattern, domain: domain || new URL(pageUrl).hostname });
    } catch { return []; }
  };
}

const POLISH_HTML = [
  { name: 'itpraca.pl',        url: 'https://itpraca.pl/offers',                    pop: 6, desc: 'Polski portal pracy IT',           pattern: { block: 'offer-item', title: '>([^<]{3,100})<', link: 'href="(/[^"]+)"' } },
  { name: 'it-manager.pl',     url: 'https://it-manager.pl/oferty',                pop: 5, desc: 'Polski portal dla managerów IT',  pattern: { block: 'offer-item', title: '>([^<]{3,100})<', link: 'href="(/[^"]+)"' } },
  { name: 'programistki.pl',   url: 'https://programistki.pl',                     pop: 6, desc: 'Społeczność programistek w Polsce', pattern: { block: 'class="offer', title: '>([^<]{3,100})<', link: 'href="(/[^"]+)"' } },
  { name: 'itwiz.pl',          url: 'https://itwiz.pl/praca',                      pop: 6, desc: 'Magazyn IT z ogłoszeniami',       pattern: { block: '<article', title: 'title">([^<]+)<', link: 'href="([^"]+)"' } },
  { name: 'infopraca.pl',      url: 'https://infopraca.pl',                        pop: 5, desc: 'Polski portal ogłoszeń pracy',    pattern: { block: 'job-offers-card', title: '>([^<]{3,100})<', link: 'href="(/[^"]+)"' } },
  { name: 'praca-zdalna.pl',   url: 'https://praca-zdalna.pl',                     pop: 4, desc: 'Portal pracy zdalnej w Polsce',  pattern: { block: 'class="job', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'interpraca.pl',     url: 'https://www.interpraca.pl',                   pop: 5, desc: 'Polski portal ogłoszeń',         pattern: { block: 'class="job', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'praca.pro',         url: 'https://praca.pro',                           pop: 4, desc: 'Portal ogłoszeń IT',             pattern: { block: 'class="job', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'pracabezdoswiadczenia.pl', url: 'https://www.pracabezdoswiadczenia.pl', pop: 4, desc: 'Praca dla juniorów w Polsce',   pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'praca.dlastudenta.pl', url: 'https://praca.dlastudenta.pl',             pop: 5, desc: 'Praca dla studentów w Polsce',   pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'praca.money.pl',    url: 'https://praca.money.pl',                      pop: 5, desc: 'Ogłoszenia pracy w Money.pl',    pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'jobble.pl',         url: 'https://jobble.pl/praca',                     pop: 5, desc: 'Polski portal ogłoszeń pracy',   pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'praca.pl',          url: 'https://www.praca.pl/praca/it-developer.html',pop: 6, desc: 'Polski portal pracy ogólny',    pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
];

for (const h of POLISH_HTML) {
  register(h.name, h.url, 'html', h.pop, 'pl', h.desc,
    makeHTMLScraper(h.url, h.pattern),
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TIER 5 – International HTML-scraped job boards
// ═══════════════════════════════════════════════════════════════════════

const INT_HTML = [

  { name: 'relocate.me',       url: 'https://relocate.me',                        pop: 6, region: 'int',   desc: 'Portal z ofertami z relokacją',          pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'remote4me.com',     url: 'https://remote4me.com',                      pop: 4, region: 'remote', desc: 'Agregator zdalnych ofert',               pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'remotely.jobs',     url: 'https://www.remotely.jobs',                   pop: 4, region: 'remote', desc: 'Portal z zdalnymi ofertami',             pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'djinni.co',         url: 'https://djinni.co',                           pop: 7, region: 'int',   desc: 'Ukraiński portal IT (oferty zdalne)',    pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'skipr.net',         url: 'https://skipr.net',                           pop: 3, region: 'remote', desc: 'Niszowy portal z zdalnymi ofertami',     pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'remotists.com',     url: 'https://remotists.com',                       pop: 3, region: 'remote', desc: 'Niszowy agregator zdalnych ofert',       pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'remoteleads.net',   url: 'https://remoteleads.net',                     pop: 3, region: 'remote', desc: 'Niszowy portal z zdalnymi ofertami',      pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'dailyremote.com',   url: 'https://dailyremote.com/remote-job/devops',   pop: 4, region: 'remote', desc: 'Codzienny agregator zdalnych ofert',     pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'flexjobs.com',      url: 'https://www.flexjobs.com/search?search=devops', pop: 6, region: 'remote', desc: 'Premium portal z zdalnymi ofertami',     pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'jobisjob.pl',       url: 'https://www.jobisjob.pl/praca/it',            pop: 6, region: 'pl',   desc: 'Polski agregator ofert pracy',           pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'gowork.pl',         url: 'https://www.gowork.pl/praca/it',              pop: 6, region: 'pl',   desc: 'Polski portal z opiniami i ofertami',    pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
  { name: 'pracodajnia.pl',    url: 'https://pracodajnia.pl',                      pop: 4, region: 'pl',   desc: 'Polski portal ogłoszeń',                pattern: { block: 'class="(?:job|offer|card)', title: '>([^<]{3,100})<', link: 'href="([^"]+)"' } },
];

for (const h of INT_HTML) {
  register(h.name, h.url, 'html', h.pop, h.region, h.desc,
    makeHTMLScraper(h.url, h.pattern),
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TIER 6 – RSS feeds from Polish sites
// ═══════════════════════════════════════════════════════════════════════

register('itpraca.pl (RSS)', 'https://itpraca.pl/feed', 'rss', 5, 'pl',
  'RSS itpraca.pl', makeRSSScraper('https://itpraca.pl/feed'));

register('it-manager.pl (RSS)', 'https://it-manager.pl/feed', 'rss', 4, 'pl',
  'RSS it-manager.pl', makeRSSScraper('https://it-manager.pl/feed'));

register('programistki.pl (RSS)', 'https://programistki.pl/feed', 'rss', 5, 'pl',
  'RSS programistki.pl', makeRSSScraper('https://programistki.pl/feed'));

register('itwiz.pl (RSS)', 'https://itwiz.pl/feed', 'rss', 5, 'pl',
  'RSS itwiz.pl', makeRSSScraper('https://itwiz.pl/feed'));

export { SOURCES };

// ─── Public API ──────────────────────────────────────────────────────
export function getSourceInfo(name) {
  return SOURCES.find(s => s.name === name) || null;
}

export function getSourcesList() {
  return SOURCES.map(s => ({
    name: s.name,
    url: s.url,
    type: s.type,
    popularity: s.popularity,
    region: s.region,
    description: s.description,
    warning: s.popularity < 5 ? '⚠️ Mało znana strona - zalecana ostrożność' : null,
  }));
}

function deduplicate(offers) {
  const seen = new Set();
  return offers.filter(o => {
    const key = `${o.source}|${o.title}|${o.company}`.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function scrapeAllSources(onProgress) {
  const results = [];
  for (let i = 0; i < SOURCES.length; i++) {
    const s = SOURCES[i];
    try {
      if (onProgress) onProgress(s.name, 'pending', s.popularity, i, SOURCES.length);
      const offers = await s.scraper();
      const tagged = offers.map(o => ({ ...o, source: s.name, _popularity: s.popularity }));
      results.push(...tagged);
      if (onProgress) onProgress(s.name, 'done', s.popularity, i, SOURCES.length, offers.length);
    } catch (err) {
      if (onProgress) onProgress(s.name, 'error', s.popularity, i, SOURCES.length, err.message);
    }
  }
  return results;
}
