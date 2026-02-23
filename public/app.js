const grid = document.getElementById('snack-grid');
const template = document.getElementById('snack-card-template');
const randomBtn = document.getElementById('random-btn');
const favoritesToggle = document.getElementById('favorites-toggle');
const searchInput = document.getElementById('search-input');
const INTRO_MESSAGE = `<p class="grid-placeholder">Tryck på "Ge mig ett mellanmål" för att skapa ditt första recept.</p>`;

const COOKIE_CONSENT_KEY = 'cookieConsentAccepted';
const cookieBanner = document.getElementById('cookie-banner');
const cookieAcceptBtn = document.getElementById('cookie-accept');

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
let searchQuery = '';


function hasCookieConsent() {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
  } catch (_error) {
    return false;
  }
}

function setCookieConsent() {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
  } catch (error) {
    console.warn('Kunde inte spara cookie-val', error);
  }
}

function setupCookieBanner() {
  if (!cookieBanner || !cookieAcceptBtn) {
    return;
  }

  if (hasCookieConsent()) {
    cookieBanner.classList.add('is-hidden');
    return;
  }

  cookieBanner.classList.remove('is-hidden');
  cookieAcceptBtn.addEventListener('click', () => {
    setCookieConsent();
    cookieBanner.classList.add('is-hidden');
  });
}

function uniqueByName(list) {
  const seen = new Set();
  return list.filter(snack => {
    if (seen.has(snack.name)) {
      return false;
    }
    seen.add(snack.name);
    return true;
  });
}


async function loadSnacks() {
  const res = await fetch('/api/snacks');
  snacks = await res.json();
  current = [];
  hasShownInitial = false;
  showingFavorites = false;
  if (favoritesToggle) {
    favoritesToggle.textContent = 'Visa favoriter';
  }
  if (searchInput) {
    searchQuery = searchInput.value.trim().toLowerCase();
  } else {
    searchQuery = '';
  }

  if (searchQuery) {
    hasShownInitial = true;
    current = getFilteredList();
    render(current);
    return;
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

function matchesSearch(snack, query) {
  if (!query) {
    return true;
  }

  const haystack = [
    snack.name,
    snack.energy,
    snack.boost,
    ...(snack.ingredients || []),
    ...(snack.instructions || [])
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function getFilteredList() {
  let filtered = snacks.filter(snack => matchesSearch(snack, searchQuery));
  if (showingFavorites) {
    filtered = filtered.filter(snack => favorites.has(snack.name));
    filtered = uniqueByName(filtered);
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

if (searchInput) {
  searchInput.addEventListener('input', event => {
    searchQuery = event.target.value.trim().toLowerCase();

    if (!searchQuery && !showingFavorites) {
      hasShownInitial = false;
      current = [];
      grid.innerHTML = INTRO_MESSAGE;
      return;
    }

    hasShownInitial = true;
    if (!snacks.length) {
      return;
    }

    current = getFilteredList();
    render(current);
  });
}

randomBtn.addEventListener('click', () => {
  if (!snacks.length) return;

  if (showingFavorites) {
    showingFavorites = false;
    if (favoritesToggle) {
      favoritesToggle.textContent = 'Visa favoriter';
    }
  }

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

if (favoritesToggle) {
  favoritesToggle.addEventListener('click', () => {
    if (!snacks.length) return;

    if (showingFavorites) {
      showingFavorites = false;
      favoritesToggle.textContent = 'Visa favoriter';

      if (searchQuery) {
        hasShownInitial = true;
        current = getFilteredList();
        render(current);
      } else {
        hasShownInitial = false;
        current = [];
        grid.innerHTML = INTRO_MESSAGE;
      }
      return;
    }

    showingFavorites = true;
    hasShownInitial = true;
    favoritesToggle.textContent = 'Tillbaka';
    current = getFilteredList();
    render(current);
  });
  favoritesToggle.textContent = 'Visa favoriter';
}

setupCookieBanner();
loadSnacks();
