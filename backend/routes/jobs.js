import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { get, all, run } from '../database.js';
import { authenticate } from '../middleware/auth.js';
import { scrapeAll, getSourcesList } from '../services/scraper.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PROFILES_CACHE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'market_profiles.json');

const router = Router();

function matchWord(text, word) {
  if (word.length <= 3) {
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(text);
  }
  return text.toLowerCase().includes(word.toLowerCase());
}

const SKILL_ALIASES = {
  rust: ['rust', 'rust-lang'],
  typescript: ['typescript', 'ts', 'type script'],
  javascript: ['javascript', 'js', 'ecmascript', 'es6', 'es2015'],
  react: ['react', 'reactjs', 'react.js'],
  'node.js / express': ['node.js', 'nodejs', 'express.js', 'expressjs', 'nestjs', 'nest.js'],
  'next.js': ['next.js', 'nextjs'],
  vue: ['vue', 'vuejs', 'vue.js'],
  angular: ['angular', 'angularjs'],
  python: ['python', 'django', 'flask', 'fastapi'],
  sqlite: ['sqlite', 'sqlite3', 'libsql'],
  postgresql: ['postgresql', 'postgres', 'pgsql', 'psql'],
  mysql: ['mysql', 'mariadb'],
  mongodb: ['mongodb', 'mongo', 'mongoose'],
  supabase: ['supabase'],
  docker: ['docker', 'docker-compose', 'containerization'],
  kubernetes: ['kubernetes', 'k8s'],
  'cloudflare workers': ['cloudflare workers'],
  aws: ['aws', 'amazon web services', 'lambda', 's3', 'ec2', 'cloudfront'],
  gcp: ['gcp', 'google cloud platform'],
  'linux server admin': ['linux', 'unix', 'ubuntu', 'debian', 'centos', 'sysadmin', 'system administration', 'linux administration'],
  'devops / ci-cd': ['devops', 'ci/cd', 'ci-cd', 'cicd', 'jenkins', 'github actions', 'gitlab ci', 'circleci'],
  git: ['git', 'github', 'gitlab', 'version control'],
  'ai / llm integration': ['llm', 'gpt', 'openai', 'claude', 'machine learning', 'artificial intelligence', 'nlp', 'large language model', 'genai', 'generative ai'],
  html: ['html', 'html5'],
  css: ['css', 'css3', 'scss', 'sass', 'tailwind', 'tailwindcss', 'bootstrap'],
  rest: ['rest', 'restful', 'rest api'],
  graphql: ['graphql', 'gql', 'apollo'],
  webpack: ['webpack', 'vite', 'esbuild', 'rollup'],
  jest: ['jest', 'playwright', 'cypress', 'vitest'],
  redis: ['redis'],
  nginx: ['nginx', 'apache'],
  'c# / .net': ['c#', 'csharp', '.net core', 'asp.net', '.net 8', 'dotnet', '.net framework'],
  java: ['java', 'spring boot', 'kotlin', 'jvm'],
  go: ['golang', 'go '],
  php: ['php', 'laravel', 'symfony'],
  ruby: ['ruby', 'rails', 'ruby on rails'],
  elixir: ['elixir', 'phoenix'],
  'machine learning': ['machine learning', 'deep learning', 'ml', 'tensorflow', 'pytorch', 'keras'],
  blockchain: ['blockchain', 'solidity', 'web3', 'ethereum', 'smart contract'],
  'rapid prototyping': ['rapid prototyping', 'prototyping', 'mvp', 'poc', 'proof of concept'],
  sql: ['sql', 'relational database', 'rdbms', 'orm', 'prisma', 'drizzle', 'typeorm'],
  websocket: ['websocket', 'socket.io', 'realtime', 'real-time'],
  stripe: ['stripe', 'payment gateway'],
  testing: ['testing', 'tdd', 'unit test', 'integration test', 'e2e'],
  'ci/cd': ['continuous integration', 'continuous deployment', 'continuous delivery'],
  webgl: ['webgl', 'webgpu', 'wgpu', 'three.js', 'babylon', 'opengl', 'vulkan', '3d graphics'],
  'game development': ['game development', 'gamedev', 'unity', 'unreal', 'godot'],
  monitoring: ['grafana', 'prometheus', 'datadog', 'sentry', 'observability'],
  security: ['cybersecurity', 'owasp', 'authentication', 'authorization', 'oauth', 'jwt', 'zero trust'],
  mobile: ['react native', 'flutter', 'swiftui'],
  microservices: ['microservices', 'micro-services', 'distributed system'],
  messagequeue: ['rabbitmq', 'kafka', 'pub/sub', 'nats'],
  sap: ['sap', 'fiori', 'abap', 'sap hana'],
  'embedded / iot': ['embedded', 'iot', 'firmware', 'microcontroller', 'raspberry', 'arduino'],
  salesforce: ['salesforce', 'apex', 'lwc'],
  powerbi: ['power bi', 'powerbi', 'tableau'],
  erp: ['erp', 'oracle ebusiness', 'sap'],
  delphi: ['delphi', 'object pascal'],
  soa: ['soa', 'service oriented architecture'],
  mainframe: ['mainframe', 'cobol', 'z/os'],
  'sap basis': ['sap basis', 'sap admin'],
  'sap abap': ['abap'],
  'sap fiori': ['fiori'],
  'oracle database': ['oracle database', 'oracle dba', 'oracle db', 'pl/sql'],
  'ibm technologies': ['ibm', 'websphere', 'lotus', 'domino'],
  hadoop: ['hadoop', 'spark', 'big data', 'databricks'],
  'sas / spss': ['sas', 'spss', 'statistical analysis'],
  'bi / reporting': ['bi', 'business intelligence', 'cognos', 'microstrategy'],
  sharepoint: ['sharepoint', 'microsoft sharepoint'],
  'dynamics 365': ['dynamics 365', 'dynamics crm', 'power platform'],
  'data engineering': ['data engineering', 'data pipeline', 'etl', 'data warehouse', 'data lake', 'airflow', 'dbt'],
  'data science': ['data science', 'data scientist', 'statistical modeling', 'regression', 'classification'],
  'qa / testing': ['qa', 'quality assurance', 'manual testing', 'manual tester', 'test automation', 'selenium'],
  'project management': ['project management', 'pmp', 'prince2', 'scrum master', 'agile coach'],
  'product management': ['product management', 'product owner', 'product manager'],
  'business analysis': ['business analysis', 'business analyst', 'requirements analysis'],
  'technical writing': ['technical writing', 'technical writer', 'documentation'],
  'ux / design': ['ux', 'ui design', 'figma', 'sketch', 'adobe xd', 'user interface', 'user experience'],
  'hr / recruitment': ['hr', 'recruitment', 'talent acquisition', 'human resources'],
  marketing: ['marketing', 'seo', 'sem', 'content marketing', 'digital marketing'],
  'soc / network': ['soc', 'network security', 'cisco', 'fortinet', 'firewall', 'network engineer'],
  terraform: ['terraform', 'iac', 'infrastructure as code', 'pulumi'],
  'ansible': ['ansible', 'configuration management'],
};

function detectSkills(text) {
  if (!text) return {};
  const lower = text.toLowerCase();
  const found = {};
  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    for (const alias of aliases) {
      if (matchWord(lower, alias) || (alias.length > 3 && lower.includes(alias))) {
        found[skill] = (found[skill] || 0) + 1; break;
      }
    }
  }
  return found;
}

// ─── Market profiles ──────────────────────────────────────
let marketProfiles = null;

const MARKET_ROLE_ALIASES = {
  'devops engineer': ['devops', 'site reliability', 'sre', 'platform engineer'],
  'backend developer': ['backend', 'back-end', 'back end', 'server-side', 'server side'],
  'full stack developer': ['full stack', 'fullstack', 'full-stack'],
  'frontend developer': ['frontend', 'front-end', 'front end', 'ui developer'],
  'rust developer': ['rust'],
  'software engineer': ['software engineer', 'software developer'],
  'cloud engineer': ['cloud engineer', 'cloud architect', 'cloud infrastructure'],
  'ai engineer': ['ai engineer', 'ml engineer', 'artificial intelligence', 'machine learning engineer'],
  'security engineer': ['security engineer', 'cybersecurity', 'security architect'],
  'data engineer': ['data engineer', 'data pipeline', 'etl'],
  'system administrator': ['system administrator', 'sysadmin', 'linux administrator'],
  'network engineer': ['network engineer', 'network administrator', 'cisco'],
};

function detectMarketRoles(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();
  for (const [role, aliases] of Object.entries(MARKET_ROLE_ALIASES)) {
    if (aliases.some(a => lower.includes(a))) found.add(role);
  }
  for (const role of Object.keys(MARKET_ROLE_ALIASES)) {
    if (lower.includes(role)) found.add(role);
  }
  return [...found];
}

async function buildMarketProfiles() {
  const jobs = await all('SELECT title, description, skills_text, salary_min, salary_max, currency FROM jobs', []);
  const profiles = {};
  const salaryData = {};

  for (const job of jobs) {
    const text = [job.title, job.description, job.skills_text].filter(Boolean).join(' ');
    const roles = detectMarketRoles(text);
    const skills = detectSkills(text);

    for (const role of roles) {
      if (!profiles[role]) profiles[role] = { totalOffers: 0, skills: {} };
      profiles[role].totalOffers++;
      for (const [skill, weight] of Object.entries(skills)) {
        if (!profiles[role].skills[skill]) profiles[role].skills[skill] = { totalWeight: 0, count: 0 };
        profiles[role].skills[skill].totalWeight += weight;
        profiles[role].skills[skill].count++;
      }

      if (!salaryData[role]) salaryData[role] = { min: [], max: [] };
      if (job.salary_min) salaryData[role].min.push(job.salary_min);
      if (job.salary_max) salaryData[role].max.push(job.salary_max);
    }
  }

  for (const [role, data] of Object.entries(profiles)) {
    for (const stats of Object.values(data.skills)) {
      stats.avgWeight = Math.round((stats.totalWeight / data.totalOffers) * 100) / 100;
      stats.frequency = Math.round((stats.count / data.totalOffers) * 100) / 100;
    }
    const sal = salaryData[role];
    if (sal && sal.min.length > 2) {
      const mins = sal.min.sort((a, b) => a - b);
      const maxs = sal.max.sort((a, b) => a - b);
      data.salary = {
        avgMin: Math.round(mins.reduce((a, b) => a + b, 0) / mins.length),
        avgMax: Math.round(maxs.reduce((a, b) => a + b, 0) / maxs.length),
        medianMin: mins[Math.floor(mins.length / 2)],
        medianMax: maxs[Math.floor(maxs.length / 2)],
        currency: 'PLN',
      };
    }
  }

  marketProfiles = profiles;
  try { fs.writeFileSync(PROFILES_CACHE, JSON.stringify(profiles)); } catch {}
  return profiles;
}

function loadMarketProfiles() {
  try {
    if (fs.existsSync(PROFILES_CACHE)) {
      marketProfiles = JSON.parse(fs.readFileSync(PROFILES_CACHE, 'utf-8'));
      return true;
    }
  } catch {}
  return false;
}

function computeLearningPriority(userSkills, role) {
  if (!marketProfiles || !marketProfiles[role]) return [];
  const profile = marketProfiles[role];
  const gaps = [];

  for (const [skill, stats] of Object.entries(profile.skills)) {
    if (stats.frequency < 0.1) continue;
    const us = findUserSkill(userSkills, skill);
    const userLevel = us ? us.level : 0;
    const expectedLevel = stats.frequency >= 0.7 ? 7
      : stats.frequency >= 0.4 ? 5
      : stats.frequency >= 0.15 ? 3 : 1;
    const gap = Math.max(0, expectedLevel - userLevel);
    if (gap > 0) {
      gaps.push({
        skill,
        marketFreq: stats.frequency,
        expectedLevel,
        userLevel,
        gap,
        priority: Math.round(stats.frequency * 100 * gap),
      });
    }
  }

  return gaps.sort((a, b) => b.priority - a.priority).slice(0, 8);
}

function computeMarketFit(userSkills, role) {
  if (!marketProfiles || !marketProfiles[role]) return null;
  const profile = marketProfiles[role];
  if (profile.totalOffers < 2) return null;

  const sortedSkills = Object.entries(profile.skills)
    .sort((a, b) => b[1].frequency - a[1].frequency)
    .slice(0, 20);

  let score = 0, totalWeight = 0;
  let userTotalLevel = 0, marketTotalLevel = 0;
  const breakdown = [];

  for (const [skill, stats] of sortedSkills) {
    const weight = Math.round(stats.frequency * 10);
    totalWeight += weight;
    const expectedLevel = stats.frequency >= 0.7 ? 7
      : stats.frequency >= 0.4 ? 5
      : stats.frequency >= 0.15 ? 3 : 1;
    marketTotalLevel += expectedLevel;
    const us = findUserSkill(userSkills, skill);
    if (us) {
      score += weight * (us.level / 10);
      userTotalLevel += us.level;
      breakdown.push({
        skill: us.name, userLevel: us.level, expectedLevel,
        marketWeight: stats.avgWeight,
        marketFreq: stats.frequency, status: 'matched',
      });
    } else {
      breakdown.push({
        skill, userLevel: 0, expectedLevel,
        marketWeight: stats.avgWeight,
        marketFreq: stats.frequency, status: 'missing',
      });
    }
  }

  const marketPct = marketTotalLevel > 0
    ? Math.round((userTotalLevel / marketTotalLevel) * 100)
    : 0;

  return {
    role,
    totalOffers: profile.totalOffers,
    score: totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0,
    marketCoverage: Math.min(150, marketPct),
    salary: profile.salary || null,
    breakdown: breakdown.sort((a, b) => b.marketFreq - a.marketFreq),
  };
}

// ─── Offer enrichment ────────────────────────────────────
async function enrichOffer(offer) {
  if (!offer.url || (offer.description && offer.skillsText)) return offer;
  try {
    const resp = await fetch(offer.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return offer;
    const html = await resp.text();
    const $ = (await import('cheerio')).load(html);
    $('script, style, nav, footer, header, aside, noscript').remove();
    const body = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
    if (!offer.description) offer.description = body;
    if (!offer.skillsText) offer.skillsText = body;
  } catch {}
  return offer;
}

async function enrichAllEmpty() {
  const empty = await all("SELECT id, url FROM jobs WHERE (description IS NULL OR description = '' OR skills_text IS NULL OR skills_text = '') AND url IS NOT NULL", []);
  let enriched = 0;
  const batch = empty.slice(0, 100);
  await Promise.all(batch.map(async (job) => {
    try {
      const resp = await fetch(job.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(5000),
      });
      if (!resp.ok) return;
      const html = await resp.text();
      const $ = (await import('cheerio')).load(html);
      $('script, style, nav, footer, header, aside, noscript').remove();
      const body = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);
      if (body.length > 100) {
        await run('UPDATE jobs SET description = ?, skills_text = ? WHERE id = ?', [body, body, job.id]);
        enriched++;
      }
    } catch {}
  }));
  return enriched;
}

// ─── Rescore all jobs ───────────────────────────────────
async function rescoreAll(userSkills) {
  const jobs = await all('SELECT * FROM jobs', []);
  let updated = 0;
  for (const job of jobs) {
    const text = [job.title, job.company, job.location, job.description, job.skills_text].filter(Boolean).join(' ');
    const jobSkills = detectSkills(text);
    const roles = detectRole(text);
    const offerMatch = computeOfferMatch(userSkills, jobSkills);
    const roleFit = detectRoleFit(job.title || '', text);
    const score = Math.round(offerMatch.overall * roleFit);
    const breakdown = JSON.stringify({ breakdown: offerMatch.breakdown, coverage: offerMatch.coverage, relevance: offerMatch.relevance, roleFit });
    await run('UPDATE jobs SET match_score = ?, match_breakdown = ?, match_role = ? WHERE id = ?', [score, breakdown, roles[0] || null, job.id]);
    updated++;
  }
  return updated;
}

// ─── Best role match ────────────────────────────────────
function computeBestRoleMatch(userSkills) {
  if (!marketProfiles) return [];
  const results = [];
  for (const [role, profile] of Object.entries(marketProfiles)) {
    if (profile.totalOffers < 3) continue;
    const fit = computeMarketFit(userSkills, role);
    if (!fit) continue;
    const learn = computeLearningPriority(userSkills, role);
    results.push({
      role,
      totalOffers: profile.totalOffers,
      marketFit: fit.score,
      marketCoverage: fit.marketCoverage,
      salary: profile.salary || null,
      missingCritical: learn.filter(l => l.userLevel === 0 && l.priority >= 40).map(l => l.skill),
      topStrengths: fit.breakdown.filter(b => b.status === 'matched' && b.userLevel >= 5).slice(0, 4).map(b => b.skill),
    });
  }
  return results.sort((a, b) => b.marketFit - a.marketFit);
}

// ─── Role detection ───────────────────────────────────────
function detectRole(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found = new Set();
  for (const role of Object.keys(MARKET_ROLE_ALIASES)) {
    if (lower.includes(role)) found.add(role);
  }
  for (const aliases of Object.values(MARKET_ROLE_ALIASES)) {
    for (const alias of aliases) {
      if (lower.includes(alias)) {
        for (const [role, als] of Object.entries(MARKET_ROLE_ALIASES)) {
          if (als.includes(alias)) found.add(role);
        }
      }
    }
  }
  return [...found];
}

function detectRoleFit(title, description) {
  const text = (title || '') + ' ' + (description || '');
  const lower = text.toLowerCase();

  const positiveRoles = [
    'full stack', 'fullstack', 'backend', 'back-end', 'devops', 'rust',
    'software engineer', 'software developer', 'sre', 'site reliability',
    'platform engineer', 'cloud engineer', 'cloud developer',
    'ai engineer', 'ml engineer', 'artificial intelligence', 'machine learning',
    'systems engineer', 'systems developer', 'infrastructure',
    'web developer', 'full-stack', 'back end',
    'node.js', 'nodejs', 'typescript', 'react',
    'python developer', 'rust developer',
  ];

  const negativeRoles = [
    'frontend', 'front-end', 'front end', 'network engineer',
    'network administrator', 'system administrator', 'sysadmin',
    'helpdesk', 'it support',
    'manager', 'director', 'head of',
    'sales', 'marketing', 'hr', 'recruiter',
    'embedded', 'firmware', 'hardware',
    'mechanical', 'electrical', 'civil engineer', 'konstruktion',
    'qa', 'tester', 'test engineer', 'quality assurance',
    'mobile', 'ios', 'android', 'react native',
    'game', 'gamedev', 'unity', 'unreal',
    'data scientist', 'data engineer', 'data analyst', 'bi',
    'sap', 'oracle', 'mainframe', 'cobol',
    'java', 'php', 'ruby', 'delphi',
    'product manager', 'project manager', 'scrum master',
    'graduate', 'intern', 'trainee', 'junior',
    'soc', 'security engineer', 'cyber',
    'wordpress', 'drupal', 'joomla', 'shopify',
    'sharepoint', 'dynamics', 'power platform',
    'sap basis', 'sap consultant',
    'lead ', 'support engineer',
    'bi developer', 'etl developer',
    'service now', 'servicenow',
  ];

  const hasPositive = positiveRoles.some(r => lower.includes(r));
  const hasNegative = negativeRoles.some(r => lower.includes(r));

  if (hasPositive && !hasNegative) return 1.0;
  if (hasPositive && hasNegative) return 0.65;
  if (!hasPositive && hasNegative) return 0.2;

  return 0.5;
}

function detectPenalties(text, cvData) {
  if (!text) return { education: 0 };
  const lower = text.toLowerCase();

  const eduKeywords = ['licencjat', 'magister', 'inżynier', 'wyższe wykształcenie', 'studia wyższe',
    'tytuł magistra', 'tytuł inżyniera', 'dyplom ukończenia', 'wykształcenie wyższe',
    'bachelor', 'master\'s', 'master degree', 'bachelor degree', 'licence', 'inżynierskie',
    'uniwersytet', 'politechnika', 'uczelnia'];
  const hasEduReq = eduKeywords.some(k => lower.includes(k));
  const userEdu = cvData?.education || [];
  const education = (hasEduReq && userEdu.length === 0) ? 0.35 : 0;

  return { education };
}

function findUserSkill(userSkills, skillKey) {
  return userSkills.find(s => {
    const key = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const als = (SKILL_ALIASES[skillKey] || [skillKey]).map(a => a.toLowerCase().replace(/[^a-z0-9]/g, ''));
    return als.some(a => key.includes(a) || a.includes(key));
  });
}

function userSkillMatchesOffer(userSkills, jobSkillKeys) {
  const top = [...userSkills].sort((a, b) => b.level - a.level).slice(0, 6);
  let total = 0, matched = 0;
  for (const us of top) {
    total += us.level;
    const key = us.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hasMatch = jobSkillKeys.some(sk => {
      const als = (SKILL_ALIASES[sk] || [sk]).map(a => a.toLowerCase().replace(/[^a-z0-9]/g, ''));
      return als.some(a => key.includes(a) || a.includes(key));
    });
    if (hasMatch) matched += us.level;
  }
  return total > 0 ? (matched / total) * 100 : 0;
}

function computeOfferMatch(userSkills, jobSkills) {
  const entries = Object.entries(jobSkills).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return { overall: 0, coverage: 0, relevance: 0, breakdown: [], missing: [] };

  const totalWeight = entries.reduce((s, [, v]) => s + v, 0);
  let earned = 0;
  const breakdown = [];
  const missing = [];

  for (const [skill, weight] of entries) {
    const us = findUserSkill(userSkills, skill);
    if (us) {
      earned += (us.level / 10) * weight;
      breakdown.push({ skill: us.name, userLevel: us.level, weight, status: 'matched' });
    } else {
      missing.push({ skill, weight });
      breakdown.push({ skill, userLevel: 0, weight, status: 'missing' });
    }
  }

  const coverage = totalWeight > 0 ? (earned / totalWeight) * 100 : 0;
  const relevance = userSkillMatchesOffer(userSkills, Object.keys(jobSkills));
  const overall = coverage * 0.6 + relevance * 0.4;

  return {
    overall: Math.round(overall),
    coverage: Math.round(coverage),
    relevance: Math.round(relevance),
    breakdown,
    missing,
  };
}

// ─── Manual match ──────────────────────────────────────────
router.post('/match', authenticate, async (req, res) => {
  try {
    const { url, description, cvId } = req.body;
    if (!url && !description) return res.status(400).json({ error: 'Podaj URL oferty lub wklej opis' });

    let text = description || '';
    if (url) {
      const resp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
      const html = await resp.text();
      const $ = (await import('cheerio')).load(html);
      $('script, style, nav, footer, header, aside').remove();
      text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000);
    }

    let cvData;
    if (cvId && req.userId) {
      const cv = await get('SELECT * FROM cvs WHERE id = ? AND user_id = ?', [cvId, req.userId]);
      if (cv) cvData = JSON.parse(cv.data);
    }
    if (!cvData) {
      const cvs = await all('SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [req.userId]);
      if (cvs.length > 0) cvData = JSON.parse(cvs[0].data);
    }
    if (!cvData) return res.status(404).json({ error: 'Brak CV. Najpierw utwórz CV.' });

    const userSkills = cvData.skills || [];
    const jobSkills = detectSkills(text);
    const roles = detectRole(text);
    const offerMatch = computeOfferMatch(userSkills, jobSkills);
    const penalties = detectPenalties(text, cvData);
    const roleFit = detectRoleFit(text, text);
    const score = Math.round(offerMatch.overall * (1 - (penalties.education || 0)) * roleFit);

    const marketFit = computeMarketFit(userSkills, roles[0]);
    const learningPriority = roles[0] ? computeLearningPriority(userSkills, roles[0]) : [];

    res.json({
      match: score,
      coverage: offerMatch.coverage,
      relevance: offerMatch.relevance,
      roleFit,
      detectedRole: roles[0] || null,
      detectedRoles: roles,
      detectedSkills: Object.keys(jobSkills),
      breakdown: offerMatch.breakdown.sort((a, b) => b.weight - a.weight),
      missing: offerMatch.missing.sort((a, b) => b.weight - a.weight),
      penalties,
      marketFit,
      learningPriority,
      marketProfilesAvailable: marketProfiles ? Object.keys(marketProfiles).length : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Scan all job boards ─────────────────────────────────
router.post('/scan', authenticate, async (req, res) => {
  try {
    const cv = await all('SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [req.userId]);
    if (!cv.length) return res.status(404).json({ error: 'Brak CV' });
    const cvData = JSON.parse(cv[0].data);
    const userSkills = cvData.skills || [];

    const offers = await scrapeAll();

    let inserted = 0;
    for (const offer of offers) {
      const id = uuidv4();
      const text = [offer.title, offer.company, offer.location, offer.description, offer.skillsText].filter(Boolean).join(' ');
      const jobSkills = detectSkills(text);
      const roles = detectRole(text);
      const offerMatch = computeOfferMatch(userSkills, jobSkills);
      const penalties = detectPenalties(text, cvData);
      const roleFit = detectRoleFit(offer.title || '', text);
      const score = Math.round(offerMatch.overall * (1 - (penalties.education || 0)) * roleFit);

      const existing = await get('SELECT id FROM jobs WHERE url = ? AND user_id = ?', [offer.url, req.userId]);
      if (existing) continue;

      await run(`INSERT INTO jobs (id, user_id, source, title, company, location, salary_min, salary_max, currency, description, skills_text, url, posted_at, match_score, match_breakdown, match_role, market_position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.userId, offer._sourceLabel || offer.source,
         offer.title, offer.company || null, offer.location || null,
         offer.salaryMin, offer.salaryMax, offer.currency || 'PLN',
         offer.description || null, offer.skillsText || null, offer.url || null, offer.postedAt || null,
         score, JSON.stringify({ breakdown: offerMatch.breakdown, coverage: offerMatch.coverage, relevance: offerMatch.relevance, roleFit }), roles[0] || null, null]);
      inserted++;
    }

    await buildMarketProfiles();

    const total = await all('SELECT COUNT(*) as c FROM jobs WHERE user_id = ?', [req.userId]);
    res.json({
      scanned: offers.length, new: inserted, total: total[0].c,
      marketProfiles: marketProfiles ? Object.keys(marketProfiles).length : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Market profiles ─────────────────────────────────────
router.get('/profiles', authenticate, async (req, res) => {
  if (!marketProfiles) await buildMarketProfiles();
  const roles = Object.entries(marketProfiles).map(([role, data]) => ({
    role, totalOffers: data.totalOffers, salary: data.salary || null,
    topSkills: Object.entries(data.skills)
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 10)
      .map(([s, st]) => ({ skill: s, freq: st.frequency })),
  }));
  res.json({ roles, totalProfiles: Object.keys(marketProfiles).length });
});

router.get('/profiles/:role', authenticate, async (req, res) => {
  if (!marketProfiles) await buildMarketProfiles();
  const role = req.params.role.toLowerCase();
  const profile = marketProfiles[role];
  if (!profile) return res.status(404).json({ error: 'Profil nie znaleziony' });

  const cv = await all('SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [req.userId]);
  const userSkills = cv.length ? (JSON.parse(cv[0].data).skills || []) : [];

  const marketFit = computeMarketFit(userSkills, role);
  const learningPriority = computeLearningPriority(userSkills, role);

  res.json({
    role,
    totalOffers: profile.totalOffers,
    salary: profile.salary || null,
    skills: Object.entries(profile.skills)
      .sort((a, b) => b[1].frequency - a[1].frequency)
      .slice(0, 25)
      .map(([s, st]) => {
        const us = findUserSkill(userSkills, s);
        return {
          skill: s, frequency: st.frequency, avgWeight: st.avgWeight,
          userHas: !!us, userLevel: us ? us.level : 0,
        };
      }),
    marketFit,
    learningPriority,
  });
});

router.post('/profiles/rebuild', authenticate, async (req, res) => {
  try {
    const profiles = await buildMarketProfiles();
    const roles = Object.entries(profiles).map(([role, data]) => ({
      role, totalOffers: data.totalOffers, salary: data.salary || null,
      topSkills: Object.entries(data.skills)
        .sort((a, b) => b[1].frequency - a[1].frequency)
        .slice(0, 10)
        .map(([s, st]) => ({ skill: s, freq: st.frequency })),
    }));
    res.json({ roles, totalProfiles: Object.keys(profiles).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── List jobs ───────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { sort, source, minScore, limit } = req.query;
    let sql = 'SELECT * FROM jobs WHERE user_id = ? AND is_archived = 0';
    const params = [req.userId];
    if (source) { sql += ' AND source = ?'; params.push(source); }
    if (minScore) { sql += ' AND match_score >= ?'; params.push(parseInt(minScore)); }

    if (sort === 'date') sql += ' ORDER BY scraped_at DESC';
    else if (sort === 'salary') sql += ' ORDER BY salary_max DESC NULLS LAST';
    else sql += ' ORDER BY match_score DESC NULLS LAST, scraped_at DESC';

    if (limit) sql += ' LIMIT ?'; params.push(parseInt(limit));

    const rows = await all(sql, params);
    res.json(rows.map(r => ({
      ...r,
      matchBreakdown: r.match_breakdown ? JSON.parse(r.match_breakdown) : null,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Best role fit ─────────────────────────────────────
router.get('/best-role', authenticate, async (req, res) => {
  try {
    if (!marketProfiles && !loadMarketProfiles()) await buildMarketProfiles();
    const cv = await all('SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [req.userId]);
    if (!cv.length) return res.status(404).json({ error: 'Brak CV' });
    const userSkills = JSON.parse(cv[0].data).skills || [];
    res.json(computeBestRoleMatch(userSkills));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Sources list ────────────────────────────────────────
router.get('/sources/list', authenticate, async (req, res) => {
  res.json(getSourcesList());
});

// ─── Export CSV ─────────────────────────────────────────
router.get('/export/csv', authenticate, async (req, res) => {
  try {
    const jlist = await all('SELECT source, title, company, location, salary_min, salary_max, currency, url, match_score, match_role, posted_at, is_applied, is_archived FROM jobs WHERE user_id = ? ORDER BY match_score DESC', [req.userId]);
    const header = 'source;title;company;location;salary_min;salary_max;currency;url;match_score;match_role;posted_at;is_applied;is_archived\n';
    const rows = jlist.map(j =>
      [j.source, j.title, j.company, j.location, j.salary_min||'', j.salary_max||'', j.currency||'', j.url||'', j.match_score||'', j.match_role||'', j.posted_at||'', j.is_applied||'', j.is_archived||'']
        .map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="offers.csv"');
    res.send('\uFEFF' + header + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Stats ──────────────────────────────────────────────
router.get('/stats/summary', authenticate, async (req, res) => {
  try {
    const [total, bySource, byScore, lastScan] = await Promise.all([
      all('SELECT COUNT(*) as c FROM jobs WHERE user_id = ?', [req.userId]),
      all('SELECT source, COUNT(*) as c FROM jobs WHERE user_id = ? GROUP BY source ORDER BY c DESC', [req.userId]),
      all('SELECT match_score, COUNT(*) as c FROM jobs WHERE user_id = ? GROUP BY match_score', [req.userId]),
      get('SELECT MAX(scraped_at) as last FROM jobs WHERE user_id = ?', [req.userId]),
    ]);
    res.json({
      total: total[0].c,
      bySource,
      byScore: byScore.reduce((acc, r) => { const k = r.match_score >= 50 ? 'hot' : r.match_score >= 25 ? 'warm' : r.match_score >= 1 ? 'cold' : 'zero'; acc[k] = (acc[k]||0) + r.c; return acc; }, {}),
      lastScan: lastScan?.last || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Enrich empty offers ───────────────────────────────
router.post('/enrich', authenticate, async (req, res) => {
  try {
    const enriched = await enrichAllEmpty();
    res.json({ enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Rescore all offers ────────────────────────────────
router.post('/rescore', authenticate, async (req, res) => {
  try {
    const cv = await all('SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [req.userId]);
    if (!cv.length) return res.status(404).json({ error: 'Brak CV' });
    const userSkills = JSON.parse(cv[0].data).skills || [];
    const updated = await rescoreAll(userSkills);
    await buildMarketProfiles();
    res.json({ rescores: updated, marketProfiles: marketProfiles ? Object.keys(marketProfiles).length : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Job detail ──────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await get('SELECT * FROM jobs WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
    if (!job) return res.status(404).json({ error: 'Oferta nie znaleziona' });

    const cv = await all('SELECT * FROM cvs WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1', [req.userId]);
    const userSkills = cv.length ? (JSON.parse(cv[0].data).skills || []) : [];

    const text = [job.title, job.company, job.location, job.description, job.skills_text].filter(Boolean).join(' ');
    const roles = detectRole(text);
    const marketFit = computeMarketFit(userSkills, roles[0]);

    res.json({
      ...job,
      matchBreakdown: job.match_breakdown ? JSON.parse(job.match_breakdown) : null,
      marketFit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Update job ──────────────────────────────────────────
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { isApplied, isArchived, notes } = req.body;
    const fields = [];
    const vals = [];
    if (isApplied !== undefined) { fields.push('is_applied = ?'); vals.push(isApplied ? 1 : 0); }
    if (isArchived !== undefined) { fields.push('is_archived = ?'); vals.push(isArchived ? 1 : 0); }
    if (notes !== undefined) { fields.push('notes = ?'); vals.push(notes); }
    if (!fields.length) return res.status(400).json({ error: 'Brak pól do aktualizacji' });
    vals.push(req.params.id, req.userId);
    await run(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto-load profiles on startup
loadMarketProfiles();

export default router;
