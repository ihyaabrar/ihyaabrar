import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'assets', 'static');
fs.mkdirSync(out, { recursive: true });

const themes = {
  dark: {
    bg: '#070B14', panel: '#0D1422', panel2: '#111B2C', border: '#22304A',
    text: '#F8FAFC', muted: '#9BA8C0', accent: '#6366F1', accent2: '#8B5CF6',
    cyan: '#22D3EE', green: '#34D399', amber: '#FBBF24', red: '#FB7185'
  },
  light: {
    bg: '#F8FAFC', panel: '#FFFFFF', panel2: '#F1F5F9', border: '#CBD5E1',
    text: '#0F172A', muted: '#64748B', accent: '#4F46E5', accent2: '#7C3AED',
    cyan: '#0891B2', green: '#059669', amber: '#D97706', red: '#E11D48'
  }
};

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));

function svgShell(w, h, t, body, label='Profile visual') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<defs>
  <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.accent}"/><stop offset="1" stop-color="${t.accent2}"/></linearGradient>
  <linearGradient id="soft" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${t.accent}" stop-opacity=".28"/><stop offset="1" stop-color="${t.cyan}" stop-opacity=".08"/></linearGradient>
  <filter id="blur"><feGaussianBlur stdDeviation="35"/></filter>
</defs>
<rect width="100%" height="100%" rx="28" fill="${t.bg}"/>
${body}
</svg>`;
}

function write(name, content) { fs.writeFileSync(path.join(out, name), content); }

function hero(themeName) {
  const t = themes[themeName];
  const body = `
  <circle cx="1040" cy="55" r="170" fill="${t.accent}" opacity=".16" filter="url(#blur)"/>
  <circle cx="1120" cy="270" r="120" fill="${t.cyan}" opacity=".12" filter="url(#blur)"/>
  <rect x="30" y="30" width="1140" height="390" rx="26" fill="${t.panel}" stroke="${t.border}"/>
  <rect x="58" y="60" width="278" height="142" rx="18" fill="${t.panel2}" stroke="${t.border}"/>
  <circle cx="84" cy="84" r="6" fill="${t.red}"/><circle cx="104" cy="84" r="6" fill="${t.amber}"/><circle cx="124" cy="84" r="6" fill="${t.green}"/>
  <text x="82" y="120" fill="${t.cyan}" font-family="ui-monospace,SFMono-Regular,Consolas,monospace" font-size="18">&gt; build</text>
  <text x="82" y="148" fill="${t.cyan}" font-family="ui-monospace,SFMono-Regular,Consolas,monospace" font-size="18">&gt; learn</text>
  <text x="82" y="176" fill="${t.cyan}" font-family="ui-monospace,SFMono-Regular,Consolas,monospace" font-size="18">&gt; experiment</text>

  <text x="382" y="100" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="18">Halo, saya</text>
  <text x="382" y="154" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="46" font-weight="800">Ihya&apos; Nashirudin <tspan fill="url(#g)">Abrar</tspan></text>
  <text x="382" y="194" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="19">Informatics Student  ·  Developer  ·  AI / Data / Web</text>
  <text x="382" y="244" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="17">Building useful apps and open-source projects with a research mindset.</text>

  <rect x="382" y="280" width="116" height="42" rx="21" fill="${t.panel2}" stroke="${t.border}"/><text x="440" y="307" text-anchor="middle" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14" font-weight="700">BUILD</text>
  <rect x="510" y="280" width="116" height="42" rx="21" fill="${t.panel2}" stroke="${t.border}"/><text x="568" y="307" text-anchor="middle" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14" font-weight="700">LEARN</text>
  <rect x="638" y="280" width="150" height="42" rx="21" fill="${t.panel2}" stroke="${t.border}"/><text x="713" y="307" text-anchor="middle" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14" font-weight="700">EXPERIMENT</text>

  <rect x="840" y="275" width="282" height="88" rx="18" fill="url(#soft)" stroke="${t.border}"/>
  <text x="866" y="307" fill="${t.accent}" font-family="Georgia,serif" font-size="32">“</text>
  <text x="898" y="310" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="15" font-weight="700">Build useful things,</text>
  <text x="898" y="334" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="14">not just impressive things.</text>
  <text x="898" y="352" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="11">— Ihya&apos; Nashirudin Abrar</text>

  <path d="M40 392 C200 330 320 436 500 380 C690 322 810 428 1000 366 C1080 340 1130 344 1170 330" fill="none" stroke="url(#g)" stroke-width="4" opacity=".7"/>`;
  return svgShell(1200, 450, t, body, 'Ihya Nashirudin Abrar profile hero');
}

function stack(themeName) {
  const t = themes[themeName];
  const items = [
    ['TS', 'TypeScript', t.accent], ['JS', 'JavaScript', t.amber], ['PY', 'Python', t.cyan],
    ['AI', 'AI / LLM', t.accent2], ['DATA', 'Data', t.green], ['WEB', 'Web', t.cyan],
    ['GIT', 'Git', t.red], ['API', 'REST / GraphQL', t.accent]
  ];
  let body = `<rect x="30" y="30" width="1140" height="300" rx="24" fill="${t.panel}" stroke="${t.border}"/>
  <text x="60" y="82" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="28" font-weight="800">Core Stack &amp; Interests</text>
  <text x="60" y="112" fill="${t.muted}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="15">Grounded in languages and domains visible across the current GitHub profile and pinned repositories.</text>`;
  items.forEach((it, i) => {
    const row = Math.floor(i / 4), col = i % 4;
    const x = 60 + col * 273, y = 145 + row * 78;
    body += `<rect x="${x}" y="${y}" width="250" height="60" rx="16" fill="${t.panel2}" stroke="${t.border}"/>
      <rect x="${x+14}" y="${y+12}" width="36" height="36" rx="10" fill="${it[2]}" opacity=".18"/>
      <text x="${x+32}" y="${y+35}" text-anchor="middle" fill="${it[2]}" font-family="ui-monospace,Consolas,monospace" font-size="10" font-weight="800">${esc(it[0])}</text>
      <text x="${x+64}" y="${y+37}" fill="${t.text}" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="15" font-weight="700">${esc(it[1])}</text>`;
  });
  return svgShell(1200, 360, t, body, 'Core stack and interests');
}

for (const theme of ['dark', 'light']) {
  write(`hero-${theme}.svg`, hero(theme));
  write(`stack-${theme}.svg`, stack(theme));
}

console.log('Static assets generated.');
