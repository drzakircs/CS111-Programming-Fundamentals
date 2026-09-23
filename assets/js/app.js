const weekGrid = document.getElementById('weekGrid');
const weekSearch = document.getElementById('weekSearch');
const materialFrame = document.getElementById('materialFrame');
const viewerEmpty = document.getElementById('viewerEmpty');
const viewerTitle = document.getElementById('viewerTitle');
const viewerPath = document.getElementById('viewerPath');
const openNewTab = document.getElementById('openNewTab');

const GITHUB_REPO = 'drzakircs/CS111-Programming-Fundamentals';
const GITHUB_BRANCH = 'main';
const MATERIALS_DIR = 'materials';
const MATERIALS_API = `https://api.github.com/repos/${GITHUB_REPO}/contents/${MATERIALS_DIR}?ref=${GITHUB_BRANCH}`;

let weeks = [];
let materialsByWeek = new Map();

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function detectWeekNumber(fileName) {
  // Accepts: Week2, Week02, Week_2, Week-02, week 2, etc.
  const match = String(fileName).match(/week[\s_-]*0*(\d{1,2})(?!\d)/i);
  if (!match) return null;
  const week = Number(match[1]);
  return week >= 1 && week <= 15 ? week : null;
}

function prettyMaterialName(fileName) {
  return String(fileName)
    .replace(/\.html?$/i, '')
    .replace(/^CS111[_\-\s]*Programming[_\-\s]*Fundamentals[_\-\s]*/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMaterialPath(path) {
  if (!path) return '#';
  // Jekyll may return /RepositoryName/materials/file.html while the GitHub API
  // fallback returns materials/file.html. Both work on GitHub Pages.
  return encodeURI(path);
}

function buildMaterialIndex(materials) {
  const map = new Map();

  (materials || []).forEach(file => {
    const name = file.name || String(file.path || '').split('/').pop();
    if (!name || !/\.html?$/i.test(name)) return;

    const week = detectWeekNumber(name);
    if (!week) return;

    const item = {
      name,
      label: prettyMaterialName(name),
      path: normalizeMaterialPath(file.path || `${MATERIALS_DIR}/${name}`)
    };

    if (!map.has(week)) map.set(week, []);
    map.get(week).push(item);
  });

  for (const list of map.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
  }

  return map;
}

function renderMaterialList(weekNumber) {
  const files = materialsByWeek.get(weekNumber) || [];

  if (!files.length) {
    return `
      <div class="materials-block materials-empty">
        <div class="materials-heading">
          <span>Learning Material</span>
          <small><strong>Not uploaded yet</strong></small>
        </div>
      </div>
    `;
  }

  return `
    <div class="materials-block">
      <div class="materials-heading">
        <span>Learning Material</span>
        <small>${files.length} ${files.length === 1 ? 'file' : 'files'}</small>
      </div>
      <div class="material-list">
        ${files.map((file, index) => `
          <div class="material-item">
            <div class="material-name">
              <span class="material-index">${index + 1}</span>
              <span class="material-title-viewport" title="${escapeHtml(file.label || file.name)}">
                <span class="material-title">${escapeHtml(file.label || file.name)}</span>
              </span>
            </div>
            <div class="material-actions">
              <button
                class="btn btn-primary btn-small view-material"
                type="button"
                data-week="${weekNumber}"
                data-path="${escapeHtml(file.path)}"
                data-name="${escapeHtml(file.label || file.name)}"
              >View</button>
              <a class="btn btn-secondary btn-small" href="${escapeHtml(file.path)}" target="_blank" rel="noopener">Open</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function setupMaterialNameScrolling() {
  const viewports = document.querySelectorAll('.material-title-viewport');

  viewports.forEach(viewport => {
    const title = viewport.querySelector('.material-title');
    if (!title) return;

    viewport.classList.remove('is-overflowing');
    viewport.style.removeProperty('--scroll-distance');
    viewport.style.removeProperty('--scroll-duration');

    const distance = Math.max(0, title.scrollWidth - viewport.clientWidth);
    if (distance > 4) {
      viewport.style.setProperty('--scroll-distance', `${distance}px`);
      const duration = Math.min(18, Math.max(7, 7 + distance / 45));
      viewport.style.setProperty('--scroll-duration', `${duration}s`);
      viewport.classList.add('is-overflowing');
    }
  });
}

function renderWeeks(items) {
  if (!items.length) {
    weekGrid.innerHTML = '<p class="empty-result">No week matches your search.</p>';
    return;
  }

  weekGrid.innerHTML = items.map(w => `
    <article class="week-card">
      <div class="week-card-head">
        <span class="week-no">Week ${String(w.week).padStart(2, '0')}</span>
        <h3>${escapeHtml(w.title)}</h3>
      </div>
      <div class="week-card-body">
        <ol class="session-list">
          ${w.sessions.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ol>
        <div class="week-meta">
          <span class="pill">${escapeHtml(w.clo)}</span>
          <span class="pill assessment">${escapeHtml(w.assessment)}</span>
        </div>
        ${renderMaterialList(w.week)}
      </div>
    </article>
  `).join('');

  requestAnimationFrame(setupMaterialNameScrolling);

  document.querySelectorAll('.view-material').forEach(btn => {
    btn.addEventListener('click', () => {
      openMaterial({
        week: Number(btn.dataset.week),
        path: btn.dataset.path,
        name: btn.dataset.name
      });
    });
  });
}

function openMaterial(material) {
  if (!material || !material.path || material.path === '#') return;

  materialFrame.src = material.path;
  materialFrame.style.display = 'block';
  viewerEmpty.style.display = 'none';
  viewerTitle.textContent = `Week ${String(material.week).padStart(2, '0')} — ${material.name}`;
  viewerPath.textContent = decodeURI(material.path);
  openNewTab.href = material.path;
  openNewTab.classList.remove('is-disabled');
  document.getElementById('material-viewer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filterWeeks() {
  const q = weekSearch.value.trim().toLowerCase();
  const filtered = weeks.filter(w => {
    const materialNames = (materialsByWeek.get(w.week) || []).map(m => m.name);
    const haystack = [
      w.week,
      w.title,
      w.clo,
      w.assessment,
      ...w.sessions,
      ...materialNames
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
  renderWeeks(filtered);
}

weekSearch.addEventListener('input', filterWeeks);
window.addEventListener('resize', () => requestAnimationFrame(setupMaterialNameScrolling));

async function getMaterials() {
  // Primary path: GitHub Pages/Jekyll injects the file list into index.html.
  const builtIn = Array.isArray(window.CS111_MATERIALS)
    ? window.CS111_MATERIALS.filter(x => x && x.name && x.path)
    : [];

  if (builtIn.length) return builtIn;

  // Fallback: useful during local/static testing or if Jekyll processing is disabled.
  try {
    const response = await fetch(MATERIALS_API, {
      headers: { 'Accept': 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    const data = await response.json();
    return (Array.isArray(data) ? data : [])
      .filter(file => file.type === 'file' && /\.html?$/i.test(file.name))
      .map(file => ({ name: file.name, path: file.path }));
  } catch (error) {
    console.warn('Automatic material discovery failed:', error);
    return [];
  }
}

async function init() {
  try {
    const [courseResponse, materials] = await Promise.all([
      fetch('data/course.json'),
      getMaterials()
    ]);

    if (!courseResponse.ok) throw new Error('Unable to load course data.');

    const data = await courseResponse.json();
    weeks = data.weeks || [];
    materialsByWeek = buildMaterialIndex(materials);
    renderWeeks(weeks);
  } catch (err) {
    console.error(err);
    weekGrid.innerHTML = '<p class="empty-result">Course data could not be loaded. Use GitHub Pages or a local web server instead of opening index.html directly from your file system.</p>';
  }
}

init();
