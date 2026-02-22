const grid = document.getElementById('snack-grid');
const template = document.getElementById('snack-card-template');
const timeFilter = document.getElementById('time-filter');
const moodFilter = document.getElementById('mood-filter');
const randomBtn = document.getElementById('random-btn');
const prepBtn = document.getElementById('prep-btn');
const favoritesToggle = document.getElementById('favorites-toggle');
const INTRO_MESSAGE = `<p class="grid-placeholder">Tryck på "Ge mig ett mellanmål" för att skapa ditt första recept.</p>`;

const FAVORITES_KEY = 'snackFavorites';
let favorites = new Set();

try {
  const stored = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  favorites = new Set(stored);
} catch (error) {
  console.warn('Kunde inte läsa favoriter', error);
}

function persistFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  } catch (error) {
    console.warn('Kunde inte spara favoriter', error);
  }
}

function toggleFavorite(name) {
  if (favorites.has(name)) {
    favorites.delete(name);
  } else {
    favorites.add(name);
  }
  persistFavorites();
}

function setFavoriteState(button, name) {
  const isFavorite = favorites.has(name);
  button.classList.toggle('is-active', isFavorite);
  button.setAttribute('aria-pressed', isFavorite);
  button.textContent = isFavorite ? '❤' : '♡';
}

let snacks = [];
let current = [];
let showingFavorites = false;
let hasShownInitial = false;

async function loadSnacks() {
  const res = await fetch('/api/snacks');
  snacks = await res.json();
  current = [];
  hasShownInitial = false;
  showingFavorites = false;
  if (favoritesToggle) {
    favoritesToggle.classList.remove('is-active');
    favoritesToggle.textContent = 'Visa favoriter';
  }
  grid.innerHTML = INTRO_MESSAGE;
}

function render(list) {
  grid.innerHTML = '';
  if (!list.length) {
    const message = showingFavorites
      ? 'Inga favoriter matchar filtret ännu.'
      : 'Inget matchade filtret just nu.';
    grid.innerHTML = `<p class="grid-placeholder">${message}</p>`;
    return;
  }

  list.forEach(snack => {
    const card = template.content.cloneNode(true);
    const article = card.querySelector('article');
    article.style.setProperty('--accent', snack.color);
    article.style.background = `linear-gradient(180deg, ${snack.color}, #ffffff)`;
    article.querySelector('.time').textContent = snack.time;
    article.querySelector('h2').textContent = snack.name;
    article.querySelector('.energy').textContent = snack.energy;
    article.querySelector('.boost').textContent = snack.boost;

    const listEl = article.querySelector('.ingredients');
    snack.ingredients.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      listEl.appendChild(li);
    });

    const instructionsList = article.querySelector('.instructions');
    const instructionsHeading = article.querySelector('h3');
    if (Array.isArray(snack.instructions) && snack.instructions.length) {
      snack.instructions.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        instructionsList.appendChild(li);
      });
    } else {
      instructionsHeading?.remove();
      instructionsList?.remove();
    }

    const favoriteBtn = article.querySelector('.favorite-btn');
    setFavoriteState(favoriteBtn, snack.name);
    favoriteBtn.addEventListener('click', event => {
      event.stopPropagation();
      toggleFavorite(snack.name);
      setFavoriteState(favoriteBtn, snack.name);
      if (showingFavorites) {
        const filteredAfter = getFilteredList();
        current = filteredAfter;
        render(filteredAfter);
      }
    });

    grid.appendChild(card);
  });
}

function getFilteredList() {
  const timeValue = timeFilter.value;
  const moodValue = moodFilter.value;
  let filtered = snacks.filter(snack => {
    const timeOk = timeValue === 'all' ||
      (timeValue === 'quick' && snack.kind === 'quick') ||
      (timeValue === 'batch' && snack.kind === 'batch');
    const moodOk = moodValue === 'all' || snack.moods.includes(moodValue);
    return timeOk && moodOk;
  });
  if (showingFavorites) {
    filtered = filtered.filter(snack => favorites.has(snack.name));
  }
  return filtered;
}

function applyFilters() {
  if (!snacks.length || !hasShownInitial) {
    return;
  }
  current = getFilteredList();
  render(current);
}

randomBtn.addEventListener('click', () => {
  if (!snacks.length) return;
  const filteredPool = hasShownInitial ? getFilteredList() : snacks;
  const source = filteredPool.length ? filteredPool : snacks;
  if (!source.length) {
    grid.innerHTML = '<p class="grid-placeholder">Inga recept matchar filtret just nu.</p>';
    return;
  }
  const choice = source[Math.floor(Math.random() * source.length)];
  hasShownInitial = true;
  current = [choice];
  render([choice]);
});

timeFilter.addEventListener('change', () => {
  if (!snacks.length || !hasShownInitial) return;
  applyFilters();
});

moodFilter.addEventListener('change', () => {
  if (!snacks.length || !hasShownInitial) return;
  applyFilters();
});

if (favoritesToggle) {
  favoritesToggle.addEventListener('click', () => {
    if (!snacks.length || !hasShownInitial) return;
    showingFavorites = !showingFavorites;
    favoritesToggle.classList.toggle('is-active', showingFavorites);
    favoritesToggle.textContent = showingFavorites ? 'Visa alla' : 'Visa favoriter';
    applyFilters();
  });
  favoritesToggle.textContent = 'Visa favoriter';
}

if (prepBtn) {
  prepBtn.addEventListener('click', () => {
    if (!snacks.length || !hasShownInitial) return;
    timeFilter.value = 'batch';
    applyFilters();
  });
}

loadSnacks();
