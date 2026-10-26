// Baut die fertige Seite aus content.json nach dist/ (Pre-Rendering).
// Lokal: node build.mjs && npx serve dist — auf Vercel läuft es automatisch.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';

const content = JSON.parse(readFileSync('content.json', 'utf8'));

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ICONS = {
  tiktok:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.31-2.83v-3.5a6.37 6.37 0 1 0 5.76 6.33V8.69a8.2 8.2 0 0 0 4.77 1.52V6.76a4.84 4.84 0 0 1-1-.07z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.77.07-2.43.11-3.56 1.26-3.67 3.67-.06 1.25-.07 1.62-.07 4.77s.01 3.52.07 4.77c.11 2.4 1.24 3.56 3.67 3.67 1.25.06 1.62.07 4.77.07s3.52-.01 4.77-.07c2.43-.11 3.56-1.27 3.67-3.67.06-1.25.07-1.62.07-4.77s-.01-3.52-.07-4.77c-.11-2.41-1.24-3.56-3.67-3.67-1.25-.06-1.62-.07-4.77-.07zm0 3.06a5 5 0 1 1 0 9.97 5 5 0 0 1 0-9.97zm0 1.8a3.18 3.18 0 1 0 0 6.37 3.18 3.18 0 0 0 0-6.37zm5.2-3.2a1.16 1.16 0 1 1 0 2.33 1.16 1.16 0 0 1 0-2.33z"/></svg>',
  mail:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" d="M3 5.5h18v13H3zM3 6l9 7 9-7"/></svg>',
};

const socials = content.socials
  .map(
    (s) =>
      `<a class="social-icon" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(s.icon)}"${
        s.event ? ` data-umami-event="${esc(s.event)}"` : ''
      }>${ICONS[s.icon] ?? ''}</a>`
  )
  .join('\n      ');

const cards = content.links
  .map((link) => {
    const isMail = link.url.startsWith('mailto:');
    const attrs = [
      `class="card${link.featured ? ' featured' : ''}"`,
      `href="${esc(link.url)}"`,
      // mailto im selben Tab öffnen (neuer Tab bliebe leer)
      isMail ? '' : 'target="_blank" rel="noopener"',
      link.event ? `data-umami-event="${esc(link.event)}"` : '',
      // Marker fürs Client-Script: hier ?ref als utm_source anhängen
      link.refToUtm ? 'data-ref-to-utm' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const img = link.image
      ? `<img class="${link.featured ? 'card-image' : 'card-thumb'}" src="${esc(link.image)}" alt="" loading="lazy">`
      : '';
    const sublabel = link.sublabel
      ? `<span class="card-sublabel">${ICONS.mail} ${esc(link.sublabel)}</span>`
      : '';
    return `<a ${attrs}>${img}<span class="card-text"><span class="card-label">${esc(link.label)}</span>${sublabel}</span></a>`;
  })
  .join('\n      ');

const { src, websiteId, domains } = content.umami ?? {};
const umamiTag =
  src && websiteId
    ? `<script defer src="${esc(src)}" data-website-id="${esc(websiteId)}"${
        domains ? ` data-domains="${esc(domains)}"` : ''
      }></script>`
    : '';

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(content.profile.name)}</title>
  <meta name="description" content="${esc(content.profile.bio)}">
  <meta property="og:title" content="${esc(content.profile.name)}">
  <meta property="og:description" content="${esc(content.profile.bio)}">
  <meta property="og:image" content="https://leonardogranetto.com/${esc(content.profile.avatar)}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <main class="page">
    <header class="profile">
      <img class="avatar" src="${esc(content.profile.avatar)}" alt="${esc(content.profile.name)}">
      <h1 class="name">${esc(content.profile.name)}</h1>
      <p class="bio">${esc(content.profile.bio)}</p>
      <nav class="socials">
      ${socials}
      </nav>
    </header>
    <section class="links">
      ${cards}
    </section>
  </main>
  <script>
    // ?ref=ig/tiktok/x → als utm_source weiterreichen + als Event-Property anhängen
    var ref = new URLSearchParams(location.search).get('ref');
    if (ref) {
      document.querySelectorAll('a[data-ref-to-utm]').forEach(function (a) {
        var u = new URL(a.href);
        u.searchParams.set('utm_source', ref);
        a.href = u.toString();
      });
      document.querySelectorAll('[data-umami-event]').forEach(function (n) {
        n.setAttribute('data-umami-event-ref', ref);
      });
    }
  </script>
  ${umamiTag}
</body>
</html>
`;

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
writeFileSync('dist/index.html', html);
cpSync('styles.css', 'dist/styles.css');
cpSync('assets', 'dist/assets', { recursive: true });
console.log('dist/ gebaut.');
