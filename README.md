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
