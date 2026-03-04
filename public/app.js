const grid = document.getElementById('snack-grid');
const template = document.getElementById('snack-card-template');
const randomBtn = document.getElementById('random-btn');
const favoritesToggle = document.getElementById('favorites-toggle');
const recipeSearch = document.getElementById('recipe-search');
const snackModal = document.getElementById('snack-modal');
const snackModalCard = document.getElementById('snack-modal-card');
const snackModalClose = document.getElementById('snack-modal-close');
const snackModalRefresh = document.getElementById('snack-modal-refresh');
const searchLabel = document.getElementById('search-label');
const languageLabel = document.getElementById('language-label');
const langSvBtn = document.getElementById('lang-sv');
const langEnBtn = document.getElementById('lang-en');

const COOKIE_CONSENT_KEY = 'cookieConsentAccepted';
const LANGUAGE_KEY = 'siteLanguage';
const cookieBanner = document.getElementById('cookie-banner');
const cookieAcceptBtn = document.getElementById('cookie-accept');
const topLinks = document.querySelector('.top-links');
const topLinksToggle = document.querySelector('.top-links-toggle');
const mobileModalMedia = window.matchMedia('(max-width: 780px)');

const FAVORITES_KEY = 'snackFavorites';
let favorites = new Set();

const translations = {
  sv: {
    pageTitle: 'Energiknatte – mellanmål för ADHD-hjärnor',
    quickLinksAria: 'Snabblänkar',
    quickLinksToggle: '☰ Snabblänkar',
    languageSelectorAria: 'Språkval',
    languageLabel: 'Språk:',
    subtitle: 'Snabba mellanmål med hjärnbränsle för barn med ADHD',
    randomButton: 'Ge mig ett mellanmål!',
    showFavorites: 'Visa favoriter',
    back: 'Tillbaka',
    searchLabel: 'Sök recept',
    searchPlaceholder: 'Sök på namn eller ingrediens',
    logoAlt: 'Energiknatte logga',
    quickLinksPrivacy: 'Integritetspolicy',
    quickLinksAbout: 'Om oss',
    quickLinksNews: 'Nyheter',
    quickLinksGuides: 'Guider',
    quickLinksLinks: 'Länkar',
    introMessage: 'Tryck på "Ge mig ett mellanmål" för att skapa ditt första recept.',
    noFavorites: 'Inga favoriter matchar filtret ännu.',
    noMatches: 'Inget matchade filtret just nu.',
    noRecipesFiltered: 'Inga recept matchar filtret just nu.',
    howTo: 'Gör så här',
    favoriteLabel: 'Markera som favorit',
    modalLabel: 'Mellanmålsförslag',
    modalNewRecipe: 'Nytt recept',
    modalBack: 'Tillbaka',
    cookieAria: 'Cookieinformation',
    cookieText:
      'Vi använder cookies för att sidan ska fungera och för att förstå hur den används. Genom att klicka på "Jag godkänner" godkänner du detta.',
    cookieReadMore: 'Läs mer',
    cookieAccept: 'Jag godkänner',
  },
  en: {
    pageTitle: 'Energiknatte – snacks for ADHD minds',
    quickLinksAria: 'Quick links',
    quickLinksToggle: '☰ Quick links',
    languageSelectorAria: 'Language selector',
    languageLabel: 'Language:',
    subtitle: 'Quick snacks with brain fuel for children with ADHD',
    randomButton: 'Give me a snack!',
    showFavorites: 'Show favorites',
    back: 'Back',
    searchLabel: 'Search recipes',
    searchPlaceholder: 'Search by name or ingredient',
    logoAlt: 'Energiknatte logo',
    quickLinksPrivacy: 'Privacy policy',
    quickLinksAbout: 'About us',
    quickLinksNews: 'News',
    quickLinksGuides: 'Guides',
    quickLinksLinks: 'Links',
    introMessage: 'Press "Give me a snack" to generate your first recipe.',
    noFavorites: 'No favorites match the current filter yet.',
    noMatches: 'Nothing matched the current filter.',
    noRecipesFiltered: 'No recipes match the current filter.',
    howTo: 'How to make it',
    favoriteLabel: 'Mark as favorite',
    modalLabel: 'Snack suggestion',
    modalNewRecipe: 'New recipe',
    modalBack: 'Back',
    cookieAria: 'Cookie information',
    cookieText:
      'We use cookies so the site works and to understand how it is used. By clicking "I accept", you consent to this.',
    cookieReadMore: 'Read more',
    cookieAccept: 'I accept',
  },
};

let language = 'sv';

try {
  const storedLanguage = localStorage.getItem(LANGUAGE_KEY);
  if (storedLanguage && translations[storedLanguage]) {
    language = storedLanguage;
  }
} catch (_error) {
  language = 'sv';
}

function t(key) {
  return translations[language][key] || translations.sv[key] || key;
}

function getIntroMessageMarkup() {
  return `<p class="grid-placeholder">${t('introMessage')}</p>`;
}

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

function setLanguage(nextLanguage) {
  if (!translations[nextLanguage]) {
    return;
  }

  language = nextLanguage;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch (_error) {
    // Ignore storage errors in private mode.
  }

  applyTranslations();

  if (!snacks.length || (!hasShownInitial && !showingFavorites)) {
    grid.innerHTML = getIntroMessageMarkup();
    return;
  }

  current = getFilteredList();
  render(current);
}

function setupLanguageSelector() {
  if (!langSvBtn || !langEnBtn) {
    return;
  }

  langSvBtn.addEventListener('click', () => setLanguage('sv'));
  langEnBtn.addEventListener('click', () => setLanguage('en'));
}

function applyTranslations() {
  document.documentElement.lang = language;
  document.title = t('pageTitle');

  topLinks?.setAttribute('aria-label', t('quickLinksAria'));
  if (topLinksToggle) {
    topLinksToggle.textContent = t('quickLinksToggle');
  }

  const languageSwitch = document.querySelector('.language-switch');
  languageSwitch?.setAttribute('aria-label', t('languageSelectorAria'));

  if (languageLabel) {
    languageLabel.textContent = t('languageLabel');
  }

  if (langSvBtn && langEnBtn) {
    langSvBtn.setAttribute('aria-pressed', String(language === 'sv'));
    langEnBtn.setAttribute('aria-pressed', String(language === 'en'));
  }

  const subtitle = document.querySelector('.subtitle');
  if (subtitle) {
    subtitle.textContent = t('subtitle');
  }

  if (randomBtn) {
    randomBtn.textContent = t('randomButton');
  }

  if (favoritesToggle) {
    favoritesToggle.textContent = showingFavorites ? t('back') : t('showFavorites');
  }

  if (searchLabel) {
    searchLabel.textContent = t('searchLabel');
  }

  if (recipeSearch) {
    recipeSearch.placeholder = t('searchPlaceholder');
  }

  const logo = document.querySelector('.hero img');
  if (logo) {
    logo.alt = t('logoAlt');
  }

  const linkTextByHref = {
    '/integritetspolicy.html': t('quickLinksPrivacy'),
    '/om-oss.html': t('quickLinksAbout'),
    '/nyheter.html': t('quickLinksNews'),
    '/guider.html': t('quickLinksGuides'),
    '/lankar.html': t('quickLinksLinks'),
  };

  document.querySelectorAll('.top-links-list a').forEach(anchor => {
    const key = anchor.getAttribute('href');
    if (key && linkTextByHref[key]) {
      anchor.textContent = linkTextByHref[key];
    }
  });

  if (snackModal) {
    snackModal.setAttribute('aria-label', t('modalLabel'));
  }

  if (snackModalClose) {
    snackModalClose.textContent = t('modalBack');
  }

  if (snackModalRefresh) {
    snackModalRefresh.textContent = t('modalNewRecipe');
  }

  if (cookieBanner) {
    cookieBanner.setAttribute('aria-label', t('cookieAria'));
    const cookieText = cookieBanner.querySelector('p');
    if (cookieText) {
      cookieText.textContent = t('cookieText');
    }
    const cookieReadMore = cookieBanner.querySelector('a');
    if (cookieReadMore) {
      cookieReadMore.textContent = t('cookieReadMore');
    }
  }

  if (cookieAcceptBtn) {
    cookieAcceptBtn.textContent = t('cookieAccept');
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
  button.setAttribute('aria-label', t('favoriteLabel'));
  button.textContent = isFavorite ? '❤' : '♡';
}

let snacks = [];
let current = [];
let showingFavorites = false;
let hasShownInitial = false;
let searchQuery = '';
let modalSource = [];

function setupTopLinksMenu() {
  if (!topLinks || !topLinksToggle) {
    return;
  }

  topLinksToggle.addEventListener('click', () => {
    const isOpen = topLinks.classList.toggle('is-open');
    topLinksToggle.setAttribute('aria-expanded', isOpen);
  });

  topLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      topLinks.classList.remove('is-open');
      topLinksToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', event => {
    if (!topLinks.contains(event.target)) {
      topLinks.classList.remove('is-open');
      topLinksToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

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

function shouldUseSnackModal() {
  return Boolean(snackModal && snackModalCard && mobileModalMedia.matches);
}

function closeSnackModal() {
  if (!snackModal) {
    return;
  }
  snackModal.setAttribute('hidden', '');
  document.body.classList.remove('is-modal-open');
}

function createSnackCard(snack) {
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
  if (instructionsHeading) {
    instructionsHeading.textContent = t('howTo');
  }

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

  return article;
}

function openSnackModal(snack, source) {
  if (!shouldUseSnackModal()) {
    return;
  }

  modalSource = source;
  snackModalCard.innerHTML = '';
  snackModalCard.appendChild(createSnackCard(snack));
  snackModal.removeAttribute('hidden');
  document.body.classList.add('is-modal-open');
}

function pickRandomSnackFrom(list, excludeName = '') {
  if (!list.length) {
    return null;
  }

  const eligible = list.filter(snack => snack.name !== excludeName);
  const source = eligible.length ? eligible : list;
  return source[Math.floor(Math.random() * source.length)] || null;
}

function presentSnackChoice(snack, source) {
  hasShownInitial = true;
  current = [snack];
  render([snack]);

  if (shouldUseSnackModal()) {
    openSnackModal(snack, source);
  }
}

async function loadSnacks() {
  const res = await fetch('/api/snacks');
  const loadedSnacks = await res.json();
  snacks = uniqueByName(loadedSnacks);
  current = [];
  hasShownInitial = false;
  showingFavorites = false;
  if (favoritesToggle) {
    favoritesToggle.textContent = t('showFavorites');
  }
  grid.innerHTML = getIntroMessageMarkup();
}

function render(list) {
  grid.innerHTML = '';
  if (!list.length) {
    const message = showingFavorites ? t('noFavorites') : t('noMatches');
    grid.innerHTML = `<p class="grid-placeholder">${message}</p>`;
    return;
  }

  list.forEach(snack => {
    grid.appendChild(createSnackCard(snack));
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
    ...(snack.instructions || []),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function getFilteredList() {
  let filtered = [...snacks];
  if (showingFavorites) {
    filtered = filtered.filter(snack => favorites.has(snack.name));
    filtered = uniqueByName(filtered);
  }

  if (searchQuery) {
    filtered = filtered.filter(snack => matchesSearch(snack, searchQuery));
  }

  return filtered;
}

function setupSnackModal() {
  if (!snackModal || !snackModalClose || !snackModalRefresh) {
    return;
  }

  snackModalClose.addEventListener('click', () => {
    closeSnackModal();
  });

  snackModalRefresh.addEventListener('click', () => {
    const source = modalSource.length ? modalSource : getFilteredList();
    const nextSnack = pickRandomSnackFrom(source.length ? source : snacks, current[0]?.name);

    if (!nextSnack) {
      return;
    }

    presentSnackChoice(nextSnack, source.length ? source : snacks);
  });

  snackModal.addEventListener('click', event => {
    if (event.target === snackModal) {
      closeSnackModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeSnackModal();
    }
  });
}

randomBtn.addEventListener('click', () => {
  if (!snacks.length) return;

  if (showingFavorites) {
    showingFavorites = false;
    if (favoritesToggle) {
      favoritesToggle.textContent = t('showFavorites');
    }
  }

  const filteredPool = hasShownInitial ? getFilteredList() : snacks;
  const source = filteredPool.length ? filteredPool : snacks;
  if (!source.length) {
    grid.innerHTML = `<p class="grid-placeholder">${t('noRecipesFiltered')}</p>`;
    return;
  }

  const choice = pickRandomSnackFrom(source);
  if (!choice) {
    return;
  }

  presentSnackChoice(choice, source);
});

if (recipeSearch) {
  recipeSearch.addEventListener('input', event => {
    searchQuery = event.target.value.trim().toLowerCase();
    if (!snacks.length) {
      return;
    }

    closeSnackModal();
    hasShownInitial = true;
    current = getFilteredList();
    render(current);
  });
}

if (favoritesToggle) {
  favoritesToggle.addEventListener('click', () => {
    if (!snacks.length) return;

    closeSnackModal();

    if (showingFavorites) {
      showingFavorites = false;
      hasShownInitial = false;
      current = [];
      favoritesToggle.textContent = t('showFavorites');
      grid.innerHTML = getIntroMessageMarkup();
      return;
    }

    showingFavorites = true;
    hasShownInitial = true;
    favoritesToggle.textContent = t('back');
    current = getFilteredList();
    render(current);
  });
  favoritesToggle.textContent = t('showFavorites');
}

setupLanguageSelector();
setupTopLinksMenu();
setupCookieBanner();
setupSnackModal();
applyTranslations();
loadSnacks();
