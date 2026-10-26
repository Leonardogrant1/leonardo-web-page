// Rendert die Seite aus content.json und kümmert sich um Tracking + ?ref-Weitergabe.
// Inhalte ändern: nur content.json anfassen, diese Datei muss nicht angepasst werden.

const ICONS = {
  tiktok:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.31-2.83v-3.5a6.37 6.37 0 1 0 5.76 6.33V8.69a8.2 8.2 0 0 0 4.77 1.52V6.76a4.84 4.84 0 0 1-1-.07z"/></svg>',
  instagram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.52.01-4.77.07-2.43.11-3.56 1.26-3.67 3.67-.06 1.25-.07 1.62-.07 4.77s.01 3.52.07 4.77c.11 2.4 1.24 3.56 3.67 3.67 1.25.06 1.62.07 4.77.07s3.52-.01 4.77-.07c2.43-.11 3.56-1.27 3.67-3.67.06-1.25.07-1.62.07-4.77s-.01-3.52-.07-4.77c-.11-2.41-1.24-3.56-3.67-3.67-1.25-.06-1.62-.07-4.77-.07zm0 3.06a5 5 0 1 1 0 9.97 5 5 0 0 1 0-9.97zm0 1.8a3.18 3.18 0 1 0 0 6.37 3.18 3.18 0 0 0 0-6.37zm5.2-3.2a1.16 1.16 0 1 1 0 2.33 1.16 1.16 0 0 1 0-2.33z"/></svg>',
};

const el = (tag, className, html) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  return node;
};

async function main() {
  const res = await fetch('content.json');
  const content = await res.json();
  const ref = new URLSearchParams(location.search).get('ref');
  const app = document.getElementById('app');

  // --- Profil ---
  const header = el('header', 'profile');
  const avatar = el('img', 'avatar');
  avatar.src = content.profile.avatar;
  avatar.alt = content.profile.name;
  header.append(avatar);
  header.append(el('h1', 'name', content.profile.name));
  header.append(el('p', 'bio', content.profile.bio));

  // --- Social-Icons unter der Bio ---
  const socials = el('nav', 'socials');
  for (const s of content.socials) {
    const a = el('a', 'social-icon', ICONS[s.icon] ?? '');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', s.icon);
    if (s.event) a.dataset.umamiEvent = s.event;
    socials.append(a);
  }
  header.append(socials);
  app.append(header);

  // --- Link-Karten ---
  const list = el('section', 'links');
  for (const link of content.links) {
    const a = el('a', link.featured ? 'card featured' : 'card');
    const url = new URL(link.url);
    // ?ref=ig/tiktok/x als utm_source weiterreichen (nur wo refToUtm gesetzt ist)
    if (ref && link.refToUtm) url.searchParams.set('utm_source', ref);
    a.href = url.toString();
    // mailto-Links im selben Tab öffnen (neuer Tab bliebe leer)
    if (url.protocol !== 'mailto:') {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    if (link.event) a.dataset.umamiEvent = link.event;

    if (link.image) {
      const img = el('img', link.featured ? 'card-image' : 'card-thumb');
      img.src = link.image;
      img.alt = '';
      img.loading = 'lazy';
      a.append(img);
    }
    a.append(el('span', 'card-label', link.label));
    list.append(a);
  }
  app.append(list);
  app.removeAttribute('aria-busy');

  // ref an alle Klick-Events hängen → in Umami pro Event filterbar
  if (ref) {
    document.querySelectorAll('[data-umami-event]').forEach((node) => {
      node.dataset.umamiEventRef = ref;
    });
  }

  // --- Umami erst NACH dem Rendern laden, damit der Tracker alle
  // data-umami-event-Elemente beim initialen Scan findet ---
  const { src, websiteId, domains } = content.umami ?? {};
  if (src && websiteId) {
    const script = document.createElement('script');
    script.defer = true;
    script.src = src;
    script.dataset.websiteId = websiteId;
    if (domains) script.dataset.domains = domains;
    document.body.append(script);
  }
}

main();
