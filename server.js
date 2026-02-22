const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4100;
const DATA_PATH = path.join(__dirname, 'data', 'snacks.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const readSnacks = () => JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const writeSnacks = snacks => fs.writeFileSync(DATA_PATH, JSON.stringify(snacks, null, 2));

app.get('/api/snacks', (_req, res) => {
  res.json(readSnacks());
});

app.post('/api/snacks', (req, res) => {
  const payload = req.body || {};
  const requiredFields = ['name', 'energy', 'boost', 'ingredients', 'instructions', 'time', 'kind', 'color', 'moods'];
  const missing = requiredFields.filter(field => {
    const value = payload[field];
    if (Array.isArray(value)) {
      return !value.length;
    }
    return value === undefined || value === '';
  });

  if (missing.length) {
    return res.status(400).json({ error: `Saknar fält: ${missing.join(', ')}` });
  }

  const snacks = readSnacks();
  if (snacks.some(snack => snack.name.toLowerCase() === payload.name.toLowerCase())) {
    return res.status(409).json({ error: 'Receptet finns redan' });
  }

  const normalized = {
    name: payload.name,
    energy: payload.energy,
    boost: payload.boost,
    ingredients: payload.ingredients,
    instructions: payload.instructions,
    time: payload.time,
    moods: payload.moods,
    kind: payload.kind,
    color: payload.color || '#ffbe0b'
  };

  snacks.push(normalized);
  writeSnacks(snacks);
  res.status(201).json(normalized);
});

app.delete('/api/snacks/:name', (req, res) => {
  const target = String(req.params.name || '').trim().toLowerCase();
  if (!target) {
    return res.status(400).json({ error: 'Namnet saknas' });
  }

  const snacks = readSnacks();
  const filtered = snacks.filter(snack => snack.name.toLowerCase() !== target);

  if (filtered.length === snacks.length) {
    return res.status(404).json({ error: 'Hittade inget recept med det namnet' });
  }

  writeSnacks(filtered);
  res.json({ ok: true });
});

app.post('/api/admin/restart', (_req, res) => {
  res.json({ ok: true, message: 'Startar om appen...' });

  setTimeout(() => {
    process.exit(0);
  }, 150);
});

app.get('/health', (_req, res) => {
  const snacks = readSnacks();
  res.json({ status: 'ok', count: snacks.length, time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Snack-appen snurrar på http://localhost:${PORT}`);
});
