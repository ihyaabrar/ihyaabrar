import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'assets', 'generated');
const dataDir = path.join(root, 'data');
fs.mkdirSync(outDir, { recursive: true });

const username = process.env.PROFILE_USERNAME || 'ihyaabrar';
const offline = process.argv.includes('--offline');
const token = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN || '';
const apiVersion = '2026-03-10';

const themes = {
  dark: {
    bg: '#070B14', panel: '#0D1422', panel2: '#111B2C', border: '#22304A',
    text: '#F8FAFC', muted: '#9BA8C0', accent: '#6366F1', accent2: '#8B5CF6',
    cyan: '#22D3EE', green: '#34D399', amber: '#FBBF24', red: '#FB7185',
    heat: ['#121B2B','#143C35','#176B4D','#1E9E67','#34D399']
  },
  light: {
    bg: '#F8FAFC', panel: '#FFFFFF', panel2: '#F1F5F9', border: '#CBD5E1',
    text: '#0F172A', muted: '#64748B', accent: '#4F46E5', accent2: '#7C3AED',
    cyan: '#0891B2', green: '#059669', amber: '#D97706', red: '#E11D48',
    heat: ['#E2E8F0','#BBF7D0','#86EFAC','#4ADE80','#16A34A']
  }
};

const escapeXml = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const nfmt = n => (n === null || n === undefined || Number.isNaN(Number(n))) ? 'SYNC' : new Intl.NumberFormat('en-US', { notation: Number(n) >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(Number(n));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function shell(w, h, t, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(label)}">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/></linearGradient>
  <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.cyan}"/></linearGradient>
</defs>
<rect width="100%" height="100%" rx="24" fill="${t.bg}"/>
${body}
</svg>`;
}

function card(x, y, w, h, t, r=18) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${t.panel}" stroke="${t.border}"/>`;
}

async function api(url, init={}) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': apiVersion,
    'User-Agent': 'ihyaabrar-profile-generator',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(init.headers || {})
  };
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function graphql(query, variables) {
  if (!token) throw new Error('GraphQL requires GITHUB_TOKEN or PROFILE_TOKEN');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ihyaabrar-profile-generator'
    },
    body: JSON.stringify({ query, variables })
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: GraphQL`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map(e => e.message).join('; '));
  return json.data;
}

async function getRepos() {
  const all = [];
  for (let page=1; page<=5; page++) {
    const batch = await api(`https://api.github.com/users/${username}/repos?type=owner&sort=updated&direction=desc&per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

async function getLanguages(repos) {
  const totals = {};
  for (const repo of repos.filter(r => !r.fork && !r.archived)) {
    try {
      const langs = await api(repo.languages_url);
      for (const [name, bytes] of Object.entries(langs)) totals[name] = (totals[name] || 0) + bytes;
    } catch (err) {
      console.warn(`Language fetch skipped for ${repo.name}: ${err.message}`);
    }
  }
  return totals;
}

function daysFromCalendar(cal) {
  if (!cal?.weeks) return [];
  return cal.weeks.flatMap(w => w.contributionDays || []).map(d => ({ date: d.date, count: d.contributionCount || 0 }));
}

function streaks(days) {
  if (!days.length) return { current: null, longest: null };
  const sorted = [...days].sort((a,b) => a.date.localeCompare(b.date));
  let longest = 0, run = 0;
  for (const d of sorted) {
    if (d.count > 0) { run++; longest = Math.max(longest, run); }
    else run = 0;
  }
  let i = sorted.length - 1;
  if (i >= 0 && sorted[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && sorted[i].count > 0) { current++; i--; }
  return { current, longest };
}

async function getContrib() {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 364);
  const query = `query($login:String!,$from:DateTime!,$to:DateTime!){
    user(login:$login){
      contributionsCollection(from:$from,to:$to){
        contributionCalendar{totalContributions weeks{firstDay contributionDays{date contributionCount weekday}}}
        totalCommitContributions totalIssueContributions totalPullRequestContributions totalPullRequestReviewContributions restrictedContributionsCount
      }
    }
  }`;
  const data = await graphql(query, { login: username, from: from.toISOString(), to: to.toISOString() });
  return data.user?.contributionsCollection || null;
}

async function buildLive(seed) {
  const profile = await api(`https://api.github.com/users/${username}`);
  const repos = await getRepos();
  const langs = await getLanguages(repos);
  let contrib = null;
  try { contrib = await getContrib(); } catch (err) { console.warn(`Contribution GraphQL skipped: ${err.message}`); }

  const pinnedBySeed = seed.pinned || [];
  const repoMap = new Map(repos.map(r => [r.name.toLowerCase(), r]));
  const pinned = pinnedBySeed.map(p => {
    const r = repoMap.get(p.name.toLowerCase());
    return r ? { name: r.name, language: r.language || p.language || 'Code', url: r.html_url, stars: r.stargazers_count, forks: r.forks_count, updatedAt: r.pushed_at || r.updated_at } : p;
  });

  return {
    username: profile.login,
    name: profile.name || seed.name,
    bio: profile.bio || seed.bio,
    location: profile.location || seed.location,
    company: profile.company || seed.company,
    website: profile.blog || seed.website,
    publicRepos: profile.public_repos,
    followers: profile.followers,
    following: profile.following,
    totalStars: repos.filter(r => !r.fork).reduce((s,r) => s + (r.stargazers_count || 0), 0),
    totalForks: repos.filter(r => !r.fork).reduce((s,r) => s + (r.forks_count || 0), 0),
    languages: Object.keys(langs).length ? langs : seed.languages,
    languageBasis: Object.keys(langs).length ? 'All owned public repositories by GitHub language bytes' : seed.languageBasis,
    pinned,
    contributions: contrib,
    generatedAt: new Date().toISOString(),
    mode: 'live'
  };
}

function renderOverview(data, themeName) {
  const t = themes[themeName];
  const cal = data.contributions?.contributionCalendar;
  const days = daysFromCalendar(cal);
  const st = streaks(days);
  const stats = [
    ['Public Repos', data.publicRepos, t.accent],
    ['Followers', data.followers, t.cyan],
    ['Stars Earned', data.totalStars, t.amber],
    ['365d Contributions', cal?.totalContributions ?? null, t.green]
  ];
  let body = `<rect x="30" y="30" width="1140" height="290" rx="24" fill="${t.panel}" stroke="${t.border}"/>
  <rect x="30" y="30" width="1140" height="6" rx="3" fill="url(#g)"/>
  <text x="60" y="82" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="27" font-weight="800">GitHub Overview</text>
  <text x="60" y="110" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14">Self-generated from GitHub APIs · no public stats-card provider</text>`;
  stats.forEach(([label, value, color], i) => {
    const x = 60 + i*273;
    body += `<rect x="${x}" y="138" width="250" height="102" rx="17" fill="${t.panel2}" stroke="${t.border}"/>
      <circle cx="${x+28}" cy="${170}" r="8" fill="${color}"/>
      <text x="${x+24}" y="205" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="28" font-weight="800">${escapeXml(nfmt(value))}</text>
      <text x="${x+24}" y="226" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="12">${escapeXml(label)}</text>`;
  });
  const status = data.mode === 'live'
    ? `Current streak ${nfmt(st.current)}d · Longest ${nfmt(st.longest)}d · ${nfmt(data.totalForks)} forks · updated ${new Date(data.generatedAt).toISOString().slice(0,10)}`
    : 'Bootstrap snapshot · first Profile Refresh will replace SYNC fields with live GitHub data';
  body += `<text x="60" y="282" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13">${escapeXml(status)}</text>`;
  return shell(1200, 350, t, body, 'GitHub overview');
}

function renderLanguages(data, themeName) {
  const t = themes[themeName];
  const entries = Object.entries(data.languages || {}).sort((a,b) => b[1]-a[1]).slice(0,7);
  const total = entries.reduce((s, [,v]) => s + Number(v || 0), 0) || 1;
  const palette = [t.accent, t.amber, t.cyan, t.green, t.accent2, t.red, t.muted];
  let body = `<rect x="30" y="30" width="1140" height="390" rx="24" fill="${t.panel}" stroke="${t.border}"/>
  <rect x="30" y="30" width="1140" height="6" rx="3" fill="url(#g)"/>
  <text x="60" y="82" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="27" font-weight="800">Language Signal</text>
  <text x="60" y="110" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13">${escapeXml(data.languageBasis || 'Repository languages')}</text>`;
  entries.forEach(([name, value], i) => {
    const y = 146 + i*38;
    const pct = clamp((Number(value)/total)*100, 0, 100);
    body += `<circle cx="68" cy="${y-5}" r="6" fill="${palette[i % palette.length]}"/>
      <text x="86" y="${y}" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14" font-weight="650">${escapeXml(name)}</text>
      <rect x="285" y="${y-14}" width="710" height="12" rx="6" fill="${t.panel2}"/>
      <rect x="285" y="${y-14}" width="${Math.max(4, 710*pct/100)}" height="12" rx="6" fill="${palette[i % palette.length]}" opacity=".9"/>
      <text x="1035" y="${y}" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13">${pct.toFixed(1)}%</text>`;
  });
  return shell(1200, 450, t, body, 'Programming language distribution');
}

function heatLevel(count, max) {
  if (!count) return 0;
  const r = count / Math.max(1,max);
  if (r < .2) return 1;
  if (r < .45) return 2;
  if (r < .7) return 3;
  return 4;
}

function renderContrib(data, themeName) {
  const t = themes[themeName];
  const cal = data.contributions?.contributionCalendar;
  const days = daysFromCalendar(cal);
  const byDate = new Map(days.map(d => [d.date, d.count]));
  const max = Math.max(1, ...days.map(d => d.count));
  let body = `<rect x="30" y="30" width="1140" height="310" rx="24" fill="${t.panel}" stroke="${t.border}"/>
  <rect x="30" y="30" width="1140" height="6" rx="3" fill="url(#g)"/>
  <text x="60" y="82" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="27" font-weight="800">Contribution Activity</text>
  <text x="60" y="110" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13">Rolling 365-day calendar rendered by this repository</text>`;

  if (!days.length) {
    body += `<rect x="60" y="140" width="1080" height="145" rx="18" fill="${t.panel2}" stroke="${t.border}" stroke-dasharray="7 7"/>
      <text x="600" y="202" text-anchor="middle" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="18" font-weight="700">Ready for first live sync</text>
      <text x="600" y="230" text-anchor="middle" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13">Run Actions → Profile Refresh, or wait for the scheduled refresh.</text>`;
  } else {
    const sorted = [...days].sort((a,b)=>a.date.localeCompare(b.date));
    const start = new Date(`${sorted[0].date}T00:00:00Z`);
    const startDow = start.getUTCDay();
    const cell=14, gap=4, x0=78, y0=146;
    sorted.forEach((d, idx) => {
      const date = new Date(`${d.date}T00:00:00Z`);
      const diff = Math.round((date - start)/86400000);
      const col = Math.floor((diff + startDow)/7);
      const row = (diff + startDow)%7;
      const lvl = heatLevel(d.count, max);
      body += `<rect x="${x0 + col*(cell+gap)}" y="${y0 + row*(cell+gap)}" width="${cell}" height="${cell}" rx="3" fill="${t.heat[lvl]}"/>`;
    });
    const c = data.contributions;
    body += `<text x="60" y="307" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="12">${nfmt(cal.totalContributions)} total · ${nfmt(c.totalCommitContributions)} commits · ${nfmt(c.totalPullRequestContributions)} PRs · ${nfmt(c.totalIssueContributions)} issues · ${nfmt(c.totalPullRequestReviewContributions)} reviews</text>`;
  }
  return shell(1200, 370, t, body, 'Contribution activity');
}

function renderSignal(data, themeName) {
  const t = themes[themeName];
  const c = data.contributions;
  const items = [
    ['Commits', c?.totalCommitContributions ?? null, t.accent],
    ['Pull Requests', c?.totalPullRequestContributions ?? null, t.cyan],
    ['Issues', c?.totalIssueContributions ?? null, t.green],
    ['Reviews', c?.totalPullRequestReviewContributions ?? null, t.accent2]
  ];
  let body = `<rect x="30" y="30" width="1140" height="250" rx="24" fill="${t.panel}" stroke="${t.border}"/>
  <rect x="30" y="30" width="1140" height="6" rx="3" fill="url(#g)"/>
  <text x="60" y="82" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="27" font-weight="800">Developer Signal</text>
  <text x="60" y="110" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="13">Contribution mix for the same rolling 365-day window</text>`;
  items.forEach(([label,value,color],i)=>{
    const x=60+i*273;
    body += `<rect x="${x}" y="140" width="250" height="94" rx="16" fill="${t.panel2}" stroke="${t.border}"/>
      <rect x="${x+18}" y="158" width="38" height="38" rx="11" fill="${color}" opacity=".18"/>
      <circle cx="${x+37}" cy="177" r="6" fill="${color}"/>
      <text x="${x+70}" y="178" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="22" font-weight="800">${escapeXml(nfmt(value))}</text>
      <text x="${x+70}" y="202" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="12">${escapeXml(label)}</text>`;
  });
  return shell(1200, 310, t, body, 'Developer signal');
}

function writeAll(data) {
  for (const theme of ['dark','light']) {
    fs.writeFileSync(path.join(outDir, `overview-${theme}.svg`), renderOverview(data, theme));
    fs.writeFileSync(path.join(outDir, `languages-${theme}.svg`), renderLanguages(data, theme));
    fs.writeFileSync(path.join(outDir, `contributions-${theme}.svg`), renderContrib(data, theme));
    fs.writeFileSync(path.join(outDir, `signal-${theme}.svg`), renderSignal(data, theme));
  }
  fs.writeFileSync(path.join(dataDir, 'profile-cache.json'), JSON.stringify(data, null, 2) + '\n');
}

const seed = JSON.parse(fs.readFileSync(path.join(dataDir, 'profile-seed.json'), 'utf8'));
let data = seed;
if (!offline) {
  try {
    data = await buildLive(seed);
  } catch (err) {
    console.warn(`Live refresh failed; keeping a renderable bootstrap profile: ${err.message}`);
    const cachePath = path.join(dataDir, 'profile-cache.json');
    if (fs.existsSync(cachePath)) {
      try { data = JSON.parse(fs.readFileSync(cachePath, 'utf8')); }
      catch { data = seed; }
    }
  }
}
writeAll(data);
console.log(`Profile assets generated in ${data.mode || 'bootstrap'} mode.`);
