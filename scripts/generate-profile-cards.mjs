import fs from "node:fs/promises";

const username = process.env.GITHUB_REPOSITORY_OWNER || "ihyaabrar";
const token = process.env.GITHUB_TOKEN;
const headers = {
  "Accept": "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? {"Authorization": `Bearer ${token}`} : {})
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, {headers});
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const profile = await gh(`/users/${username}`);
const repos = await gh(`/users/${username}/repos?per_page=100&sort=updated`);

const langTotals = {};
let stars = 0;
for (const r of repos) {
  stars += r.stargazers_count || 0;
  if (!r.fork && r.language) langTotals[r.language] = (langTotals[r.language] || 0) + 1;
}
const langs = Object.entries(langTotals).sort((a,b)=>b[1]-a[1]).slice(0,6);
const totalLang = langs.reduce((s,[,v])=>s+v,0) || 1;

const esc = s => String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const palette = ["#7C83FF","#38BDF8","#22C55E","#F59E0B","#EC4899","#A78BFA"];

function shell(w,h,dark,inner) {
  const bg=dark?"#0D1117":"#FFFFFF", fg=dark?"#F0F6FC":"#24292F", muted=dark?"#8B949E":"#57606A", border=dark?"#30363D":"#D0D7DE";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="1" y="1" width="${w-2}" height="${h-2}" rx="18" fill="${bg}" stroke="${border}"/>
  <g font-family="Segoe UI,Arial,sans-serif">${inner({fg,muted,border,bg})}</g></svg>`;
}
function overview(dark) {
  return shell(760,270,dark,({fg,muted,border})=>`
  <text x="32" y="46" fill="${fg}" font-size="22" font-weight="700">GitHub Overview</text>
  <text x="32" y="75" fill="${muted}" font-size="13">@${esc(username)}</text>
  ${[
    ["Repositories", profile.public_repos],
    ["Followers", profile.followers],
    ["Following", profile.following],
    ["Total Stars", stars],
  ].map(([k,v],i)=>{
    const x=32+(i%2)*350,y=105+Math.floor(i/2)*72;
    return `<rect x="${x}" y="${y}" width="320" height="58" rx="12" fill="none" stroke="${border}"/>
    <text x="${x+18}" y="${y+24}" fill="${muted}" font-size="12">${k}</text>
    <text x="${x+18}" y="${y+48}" fill="${fg}" font-size="20" font-weight="700">${v}</text>`;
  }).join("")}`);
}
function languages(dark) {
  return shell(760,270,dark,({fg,muted})=>`
  <text x="32" y="46" fill="${fg}" font-size="22" font-weight="700">Top Languages</text>
  <text x="32" y="74" fill="${muted}" font-size="13">By repository primary language</text>
  ${langs.map(([name,count],i)=>{
    const y=105+i*25, pct=Math.round(count/totalLang*100), bar=Math.round(380*count/totalLang);
    return `<circle cx="38" cy="${y-5}" r="6" fill="${palette[i]}"/>
    <text x="54" y="${y}" fill="${fg}" font-size="13">${esc(name)}</text>
    <rect x="220" y="${y-13}" width="380" height="10" rx="5" fill="${dark?"#21262D":"#EAEEF2"}"/>
    <rect x="220" y="${y-13}" width="${bar}" height="10" rx="5" fill="${palette[i]}"/>
    <text x="620" y="${y}" fill="${muted}" font-size="12">${pct}%</text>`;
  }).join("")}`);
}
function contributions(dark) {
  // Stable summary card. GitHub's public REST API does not expose the calendar grid directly.
  const updated = repos.filter(r=>!r.fork).sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,8);
  return shell(1540,300,dark,({fg,muted,border})=>`
  <text x="34" y="48" fill="${fg}" font-size="24" font-weight="700">Contribution Activity</text>
  <text x="34" y="77" fill="${muted}" font-size="13">Recently pushed public repositories</text>
  ${updated.map((r,i)=>{
    const col=i%4,row=Math.floor(i/4),x=34+col*370,y=108+row*82;
    return `<rect x="${x}" y="${y}" width="342" height="62" rx="12" fill="none" stroke="${border}"/>
      <circle cx="${x+24}" cy="${y+23}" r="6" fill="${palette[i%palette.length]}"/>
      <text x="${x+40}" y="${y+28}" fill="${fg}" font-size="14" font-weight="700">${esc(r.name).slice(0,30)}</text>
      <text x="${x+18}" y="${y+49}" fill="${muted}" font-size="11">updated ${new Date(r.pushed_at).toISOString().slice(0,10)}</text>`;
  }).join("")}`);
}

await fs.mkdir("assets",{recursive:true});
await Promise.all([
  fs.writeFile("assets/overview.dark.svg",overview(true)),
  fs.writeFile("assets/overview.light.svg",overview(false)),
  fs.writeFile("assets/languages.dark.svg",languages(true)),
  fs.writeFile("assets/languages.light.svg",languages(false)),
  fs.writeFile("assets/contributions.dark.svg",contributions(true)),
  fs.writeFile("assets/contributions.light.svg",contributions(false)),
]);
console.log("Profile cards generated.");
