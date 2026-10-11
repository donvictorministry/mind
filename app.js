// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Metanoia Service Worker Loaded'))
      .catch(err => console.error('SW Error:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderContent();
  setupThemeSystem();
  setupDrawerMechanics();
  setupSearchEngine();
});

// 1. Render all Data from contents.js
function renderContent() {
  // Hero Section
  document.getElementById('hero-title').textContent = RESEARCH_DATA.meta.title;
  document.getElementById('hero-subtitle').textContent = RESEARCH_DATA.meta.subtitle;
  document.getElementById('hero-ratio-badge').textContent = RESEARCH_DATA.meta.ratioBadge;
  document.getElementById('abstract-paragraph').textContent = RESEARCH_DATA.abstract;

  // Sections
  const secContainer = document.getElementById('monograph-sections');
  secContainer.innerHTML = RESEARCH_DATA.sections.map(sec => `
    <article class="card" id="${sec.id}">
      <span class="section-domain-tag">${sec.domain}</span>
      <h3 class="section-heading">${sec.number}. ${sec.title}</h3>
      <p class="body-text" style="white-space: pre-line;">${sec.content}</p>
      <div class="takeaway-box">
        <strong>Biblical/Scientific Imperative:</strong> ${sec.keyTakeaway}
      </div>
    </article>
  `).join('');

  // APA 7 References
  const refList = document.getElementById('references-list');
  refList.innerHTML = RESEARCH_DATA.references.map((r, i) => `
    <div class="ref-item-card" id="${r.id}">
      <p class="ref-domain-tag">[${i + 1}] ${r.focus}</p>
      <p class="ref-text">${r.citation}</p>
    </div>
  `).join('');

  // Author details (In-page and in right drawer)
  ['page', 'drawer'].forEach(prefix => {
    document.getElementById(`${prefix}-author-name`).textContent = RESEARCH_DATA.author.name;
    document.getElementById(`${prefix}-author-roles`).textContent = RESEARCH_DATA.author.titles;
    document.getElementById(`${prefix}-author-bio`).textContent = RESEARCH_DATA.author.bio;
    document.getElementById(`${prefix}-author-creed`).textContent = `"${RESEARCH_DATA.author.statement}"`;
  });
}

// 2. Light Mode Default + Dark Mode Switcher
function setupThemeSystem() {
  const toggleBtn = document.getElementById('btn-theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  
  // Default is light unless stored otherwise
  const currentTheme = localStorage.getItem('metanoia_theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('metanoia_theme', nextTheme);
    updateThemeIcon(nextTheme);
  });

  function updateThemeIcon(t) {
    themeIcon.textContent = (t === 'dark') ? '☀️' : '🌙';
  }
}

// 3. Two Sidebars (Left and Right Drawer Controllers)
function setupDrawerMechanics() {
  const leftDrawer = document.getElementById('left-sidebar');
  const rightDrawer = document.getElementById('right-sidebar');
  const overlay = document.getElementById('drawer-overlay');

  const openLeftBtn = document.getElementById('btn-left-drawer');
  const closeLeftBtn = document.getElementById('close-left-drawer');

  const openRightBtn = document.getElementById('btn-right-drawer');
  const closeRightBtn = document.getElementById('close-right-drawer');

  function closeAll() {
    leftDrawer.classList.remove('open');
    rightDrawer.classList.remove('open');
    overlay.classList.remove('active');
  }

  openLeftBtn.addEventListener('click', () => {
    rightDrawer.classList.remove('open');
    leftDrawer.classList.add('open');
    overlay.classList.add('active');
  });

  openRightBtn.addEventListener('click', () => {
    leftDrawer.classList.remove('open');
    rightDrawer.classList.add('open');
    overlay.classList.add('active');
  });

  closeLeftBtn.addEventListener('click', closeAll);
  closeRightBtn.addEventListener('click', closeAll);
  overlay.addEventListener('click', closeAll);

  // Jump navigation links close drawer automatically
  document.querySelectorAll('.nav-jump').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeAll();
      const targetId = link.getAttribute('data-target');
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    });
  });
}

// 4. Live Search Engine
function setupSearchEngine() {
  const searchInput = document.getElementById('app-search-input');
  const resultsContainer = document.getElementById('search-results-box');

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (q.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    const matches = [];

    // Search Sections
    RESEARCH_DATA.sections.forEach(s => {
      if (s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || s.domain.toLowerCase().includes(q)) {
        matches.push({ title: `${s.number}. ${s.title}`, desc: s.keyTakeaway, target: s.id });
      }
    });

    // Search References
    RESEARCH_DATA.references.forEach(r => {
      if (r.citation.toLowerCase().includes(q) || r.focus.toLowerCase().includes(q)) {
        matches.push({ title: `Reference: ${r.focus}`, desc: r.citation, target: r.id });
      }
    });

    if (matches.length === 0) {
      resultsContainer.innerHTML = `<p class="subtle-paragraph" style="padding: 10px;">No matches found for "${q}".</p>`;
      return;
    }

    resultsContainer.innerHTML = matches.map(m => `
      <div class="search-result-item" onclick="document.getElementById('${m.target}').scrollIntoView({behavior:'smooth'})">
        <h4>${m.title}</h4>
        <p>${m.desc.substring(0, 140)}...</p>
      </div>
    `).join('');
  });
}
