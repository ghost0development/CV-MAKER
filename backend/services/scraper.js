// ─── Main scraper – delegates to sources registry ────────────────────
import { SOURCES, getSourceInfo, getSourcesList, scrapeAllSources as scrapeAllFromRegistry } from './sources.js';

export { getSourceInfo, getSourcesList };

const RELEVANT_CATEGORIES = new Set([
  'devops', 'backend', 'fullstack', 'full-stack', 'full_stack',
  'python', 'rust', 'typescript', 'javascript', 'node', 'node.js',
  'admin', 'system', 'security', 'cloud', 'architecture',
  'testing', 'qa', 'automation', 'ai', 'data', 'database',
  'frontend', 'golang', 'go',
]);

function isCategoryRelevant(cat) {
  if (!cat) return true;
  return RELEVANT_CATEGORIES.has(cat.toLowerCase().trim());
}

// Filter offers by title skill relevance (rough check)
function isTitleRelevant(title) {
  if (!title) return true;
  const t = title.toLowerCase();
  for (const cat of RELEVANT_CATEGORIES) {
    if (cat.length <= 3) {
      const re = new RegExp('\\b' + cat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      if (re.test(t)) return true;
    } else if (t.includes(cat)) return true;
  }
  return false;
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

function categoryFilter(offers) {
  return offers.filter(o => isTitleRelevant(o.title) || isTitleRelevant(o.description));
}

export async function scrapeAll(onProgress) {
  const results = await scrapeAllFromRegistry(onProgress);
  const filtered = categoryFilter(results);
  return deduplicate(filtered);
}

export async function scrapeSource(name) {
  const sc = SOURCES.find(s => s.name === name);
  if (!sc) throw new Error(`Unknown source: ${name}`);
  try {
    const offers = await sc.scraper();
    return offers.map(o => ({ ...o, source: sc.name }));
  } catch (err) {
    throw new Error(`Source ${name} failed: ${err.message}`);
  }
}
