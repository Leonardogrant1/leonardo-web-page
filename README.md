# leonardo-web-page

Link-in-Bio-Seite für **leonardogranetto.com** — statisches HTML, kein Build,
gehostet auf Vercel. Analytics über selbst gehostetes Umami
(`analytics.leonardogranetto.com`).

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
npx serve .
# oder: python3 -m http.server 8000
```

(Einfaches Öffnen der index.html per Doppelklick funktioniert nicht,
weil `content.json` per fetch geladen wird.)

## Deployment

Vercel-Projekt auf dieses Repo zeigen lassen, Framework "Other", kein
Build-Command — fertig. Domain `leonardogranetto.com` im Vercel-Projekt
hinterlegen.
