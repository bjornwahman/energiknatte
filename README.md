<p align="center">
  <img src="public/publiclogo-energiknatte-new.png" width="300" alt="Energiknatte logo">
</p>

# Energiknatte – ADHD-vänliga mellanmål

Färgglad Node/Express-app som serverar mellanmålsförslag med fokus på energirika, näringstäta snacks för barn med ADHD.

## Kom igång
```bash
cd ~/snack-app
npm install        # om du flyttar projektet
npm run dev        # utvecklingsläge
npm start          # vanlig körning på port 4100
```

Appen exponerar:
- `GET /` – färgglad frontend
- `GET /api/snacks` – JSON med alla förslag
- `GET /health` – enkel status/heartbeat

## Lägga till fler snacks
Redigera `data/snacks.json` (namn, energi, ingredients, moods, kind). Starta om servern för att ladda nya poster.


## Skydda data (recept/nyheter) vid push/pull
Appen skriver nu **inte** till versionshanterade filer i `data/` under drift (gäller recept, nyheter, guider och länkar).
Istället används en lokal datamapp `runtime-data/` (eller valfri mapp via `DATA_DIR`).

- Vid första start kopieras seed-data från `data/snacks.json`, `data/news.json`, `data/guides.json` och `data/links.json` till `runtime-data/`.
- Alla ändringar från admin (nya recept/nyheter) sparas i `runtime-data/` och följer inte med i Git-push.
- `runtime-data/` är gitignorerad.

Exempel med egen dataplats:
```bash
DATA_DIR=/var/lib/energiknatte npm start
```

Tips för extra säkerhet:
- Ta regelbunden backup av `runtime-data/` (eller din `DATA_DIR`).
- I produktion: använd en managed databas (t.ex. Postgres/Supabase) för ännu starkare skydd.
