const weekGrid = document.getElementById('weekGrid');
const weekSearch = document.getElementById('weekSearch');
const materialFrame = document.getElementById('materialFrame');
const viewerEmpty = document.getElementById('viewerEmpty');
const viewerTitle = document.getElementById('viewerTitle');
const viewerPath = document.getElementById('viewerPath');
const openNewTab = document.getElementById('openNewTab');

let weeks = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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
        <div class="card-actions">
          <button class="btn btn-primary view-material" data-week="${w.week}" type="button">View material</button>
          <a class="btn btn-secondary" href="${encodeURI(w.material)}" target="_blank" rel="noopener">Open file</a>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.view-material').forEach(btn => {
    btn.addEventListener('click', () => openMaterial(Number(btn.dataset.week)));
  });
}

function openMaterial(weekNumber) {
  const item = weeks.find(w => w.week === weekNumber);
  if (!item) return;

  materialFrame.src = item.material;
  materialFrame.style.display = 'block';
  viewerEmpty.style.display = 'none';
  viewerTitle.textContent = `Week ${String(item.week).padStart(2, '0')} — ${item.title}`;
  viewerPath.textContent = item.material;
  openNewTab.href = item.material;
  openNewTab.classList.remove('is-disabled');
  document.getElementById('material-viewer').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

weekSearch.addEventListener('input', () => {
  const q = weekSearch.value.trim().toLowerCase();
  const filtered = weeks.filter(w => {
    const haystack = [
      w.week,
      w.title,
      w.clo,
      w.assessment,
      ...w.sessions
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
  renderWeeks(filtered);
});

fetch('data/course.json')
  .then(r => {
    if (!r.ok) throw new Error('Unable to load course data.');
    return r.json();
  })
  .then(data => {
    weeks = data.weeks || [];
    renderWeeks(weeks);
  })
  .catch(err => {
    console.error(err);
    weekGrid.innerHTML = '<p class="empty-result">Course data could not be loaded. Use GitHub Pages or a local web server instead of opening index.html directly from your file system.</p>';
  });
