const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4100;

const SEED_SNACKS_PATH = path.join(__dirname, 'data', 'snacks.json');
const SEED_NEWS_PATH = path.join(__dirname, 'data', 'news.json');
const SEED_GUIDES_PATH = path.join(__dirname, 'data', 'guides.json');
const SEED_LINKS_PATH = path.join(__dirname, 'data', 'links.json');
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'runtime-data');
const SNACKS_PATH = path.join(DATA_DIR, 'snacks.json');
const NEWS_PATH = path.join(DATA_DIR, 'news.json');
const GUIDES_PATH = path.join(DATA_DIR, 'guides.json');
const LINKS_PATH = path.join(DATA_DIR, 'links.json');

const ensureDataFile = ({ targetPath, seedPath, fallback = [] }) => {
  if (fs.existsSync(targetPath)) {
    return;
  }

  if (seedPath && fs.existsSync(seedPath)) {
    fs.copyFileSync(seedPath, targetPath);
    return;
  }

  fs.writeFileSync(targetPath, JSON.stringify(fallback, null, 2));
};

const readArrayFile = (filePath, fallback = []) => {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  return Array.isArray(parsed) ? parsed : fallback;
};

const writeArrayFile = (filePath, value) => {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const initializeStorage = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  ensureDataFile({ targetPath: SNACKS_PATH, seedPath: SEED_SNACKS_PATH, fallback: [] });
  ensureDataFile({ targetPath: NEWS_PATH, seedPath: SEED_NEWS_PATH, fallback: [] });
  ensureDataFile({ targetPath: GUIDES_PATH, seedPath: SEED_GUIDES_PATH, fallback: [] });
  ensureDataFile({ targetPath: LINKS_PATH, seedPath: SEED_LINKS_PATH, fallback: [] });
};

initializeStorage();

const readSnacks = () => readArrayFile(SNACKS_PATH, []);
const writeSnacks = snacks => writeArrayFile(SNACKS_PATH, snacks);
const readNews = () => readArrayFile(NEWS_PATH, []);
const writeNews = news => writeArrayFile(NEWS_PATH, news);
const readGuides = () => readArrayFile(GUIDES_PATH, []);
const writeGuides = guides => writeArrayFile(GUIDES_PATH, guides);
const readLinks = () => readArrayFile(LINKS_PATH, []);
const writeLinks = links => writeArrayFile(LINKS_PATH, links);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

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
  return res.status(201).json(normalized);
});


app.put('/api/snacks/:name', (req, res) => {
  const originalName = String(req.params.name || '').trim();
  if (!originalName) {
    return res.status(400).json({ error: 'Originalnamn saknas' });
  }

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
  const index = snacks.findIndex(snack => snack.name.toLowerCase() === originalName.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ error: 'Hittade inget recept att uppdatera' });
  }

  const nameCollision = snacks.some((snack, i) => i !== index && snack.name.toLowerCase() === String(payload.name).toLowerCase());
  if (nameCollision) {
    return res.status(409).json({ error: 'Ett annat recept med det namnet finns redan' });
  }

  const updated = {
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

  snacks[index] = updated;
  writeSnacks(snacks);
  return res.json(updated);
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
  return res.json({ ok: true });
});

app.get('/api/news', (_req, res) => {
  res.json(readNews());
});

app.post('/api/news', (req, res) => {
  const payload = req.body || {};
  const title = String(payload.title || '').trim();
  const content = String(payload.content || '').trim();

  if (!title || !content) {
    return res.status(400).json({ error: 'Titel och innehåll krävs' });
  }

  const news = readNews();
  const item = { id: makeId(), title, content, createdAt: new Date().toISOString() };
  news.unshift(item);
  writeNews(news);
  return res.status(201).json(item);
});

app.delete('/api/news/:id', (req, res) => {
  const id = String(req.params.id || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'Id saknas' });
  }

  const news = readNews();
  const filtered = news.filter(item => item.id !== id);

  if (filtered.length === news.length) {
    return res.status(404).json({ error: 'Nyheten hittades inte' });
  }

  writeNews(filtered);
  return res.json({ ok: true });
});

app.get('/api/guides', (_req, res) => {
  res.json(readGuides());
});

app.post('/api/guides', (req, res) => {
  const payload = req.body || {};
  const title = String(payload.title || '').trim();
  const content = String(payload.content || '').trim();

  if (!title || !content) {
    return res.status(400).json({ error: 'Titel och innehåll krävs' });
  }

  const guides = readGuides();
  const item = { id: makeId(), title, content, createdAt: new Date().toISOString() };
  guides.unshift(item);
  writeGuides(guides);
  return res.status(201).json(item);
});

app.delete('/api/guides/:id', (req, res) => {
  const id = String(req.params.id || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'Id saknas' });
  }

  const guides = readGuides();
  const filtered = guides.filter(item => item.id !== id);
  if (filtered.length === guides.length) {
    return res.status(404).json({ error: 'Guiden hittades inte' });
  }

  writeGuides(filtered);
  return res.json({ ok: true });
});

app.get('/api/links', (_req, res) => {
  res.json(readLinks());
});

app.post('/api/links', (req, res) => {
  const payload = req.body || {};
  const title = String(payload.title || '').trim();
  const url = String(payload.url || '').trim();
  const description = String(payload.description || '').trim();

  if (!title || !url) {
    return res.status(400).json({ error: 'Titel och URL krävs' });
  }

  let normalizedUrl = url;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const links = readLinks();
  const item = { id: makeId(), title, url: normalizedUrl, description, createdAt: new Date().toISOString() };
  links.unshift(item);
  writeLinks(links);
  return res.status(201).json(item);
});

app.delete('/api/links/:id', (req, res) => {
  const id = String(req.params.id || '').trim();
  if (!id) {
    return res.status(400).json({ error: 'Id saknas' });
  }

  const links = readLinks();
  const filtered = links.filter(item => item.id !== id);
  if (filtered.length === links.length) {
    return res.status(404).json({ error: 'Länken hittades inte' });
  }

  writeLinks(filtered);
  return res.json({ ok: true });
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
  console.log(`Data lagras i: ${DATA_DIR}`);
});
