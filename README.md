# leonardo-web-page

Link-in-Bio-Seite für **leonardogranetto.com** — zur Build-Zeit vorgerendertes
statisches HTML (`build.mjs` liest `content.json` und schreibt `dist/`),
gehostet auf Vercel. Crawler und Browser bekommen fertiges HTML (SEO-freundlich);
nur das `?ref`-Handling läuft als Mini-Script im Client. Analytics über selbst
gehostetes Umami (`analytics.leonardogranetto.com`).

## Inhalte ändern

Alles steht in **`content.json`** — Bio, Profilbild, Links, Tracking-Config.
Link ändern/hinzufügen = Eintrag in der Datei anpassen, committen, Vercel
deployed automatisch. Geht auch direkt im Browser über GitHub (Datei öffnen →
Stift-Icon → committen).

Felder pro Link:

| Feld | Bedeutung |
|---|---|
| `label` | Text auf der Karte |
| `url` | Ziel-Link |
| `image` | Bild/Thumbnail (Datei in `assets/`) |
| `event` | Umami-Event-Name (z. B. `click-jemp`) |
| `featured` | `true` = große Karte mit Bild oben (JEMP) |
| `refToUtm` | `true` = `?ref=…` wird als `utm_source` angehängt |

## Tracking

- Seitenaufrufe + Klick-Events laufen über Umami; die Website-ID steht in
  `content.json` unter `umami.websiteId`.
- `leonardogranetto.com?ref=ig` (oder `tiktok`, `x`, …): der `ref`-Wert wird
  als `utm_source` an den JEMP-Link gehängt und als Event-Property `ref` an
  alle Klick-Events — in Umami pro Button nach Herkunft filterbar.
- Getrackt wird nur auf den Domains aus `umami.domains` (keine
  Vercel-Previews, kein localhost).

## Lokal ansehen

```bash
node build.mjs
npx serve dist   # oder: python3 -m http.server 8000 -d dist
```

## Deployment

Vercel-Projekt auf dieses Repo zeigen lassen — Build-Command und
Output-Directory stehen in `vercel.json` (`node build.mjs` → `dist/`).
Domain `leonardogranetto.com` im Vercel-Projekt hinterlegen.
