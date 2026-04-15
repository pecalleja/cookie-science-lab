/* ============================
   COOKIE SCIENCE LAB - APP (UI)
   Uses FLOURS, CHART_COLORS, getAvgByFlour, etc. from logic.js
   ============================ */

// ---- STATE ----
let selectedFlour = null;
let ratings = JSON.parse(localStorage.getItem('cookie-ratings') || '[]');
let notebook = JSON.parse(localStorage.getItem('cookie-notebook') || '{}');
let chartInstances = {};
let compareChartInstance = null;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  renderFlourGrid();
  setupNavigation();
  setupSliders();
  setupSubmit();
  setupExport();
  setupNotebook();
  loadNotebook();
  const saved = localStorage.getItem('cookie-taster-name');
  if (saved) document.getElementById('taster-name').value = saved;
});

// ---- NAVIGATION ----
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-' + view).classList.add('active');

      if (view === 'results') refreshResults();
      if (view === 'compare') refreshCompare();
    });
  });
}

// ---- FLOUR GRID ----
function renderFlourGrid() {
  const grid = document.getElementById('flour-grid');
  grid.replaceChildren();

  FLOURS.forEach(f => {
    const count = ratings.filter(r => r.flour === f.id).length;
    const card = document.createElement('div');
    card.className = 'flour-card';
    card.dataset.flour = f.id;
    card.style.setProperty('--flour-color', f.color);
    card.style.setProperty('--flour-color-rgb', f.colorRgb);

    const emoji = document.createElement('span');
    emoji.className = 'flour-card-emoji';
    emoji.textContent = f.emoji;

    const name = document.createElement('div');
    name.className = 'flour-card-name';
    name.textContent = f.name;

    const countEl = document.createElement('div');
    countEl.className = 'flour-card-count';
    countEl.textContent = count + ' rating' + (count !== 1 ? 's' : '');

    card.append(emoji, name, countEl);
    card.addEventListener('click', () => selectFlour(f.id));
    grid.appendChild(card);
  });
}

function selectFlour(flourId) {
  selectedFlour = FLOURS.find(f => f.id === flourId);
  if (!selectedFlour) return;

  document.querySelectorAll('.flour-card').forEach(c => c.classList.remove('selected'));
  document.querySelector('.flour-card[data-flour="' + flourId + '"]').classList.add('selected');

  const panel = document.getElementById('rating-panel');
  panel.classList.remove('hidden');

  document.getElementById('rating-cookie-img').src = selectedFlour.image;
  document.getElementById('rating-flour-name').textContent = selectedFlour.name + ' Cookie';
  document.getElementById('rating-flour-fact').textContent = selectedFlour.fact;

  ['crispiness', 'softness', 'chewiness'].forEach(dim => {
    document.getElementById('slider-' + dim).value = 5;
    document.getElementById('val-' + dim).textContent = '5';
  });

  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// ---- SLIDERS ----
function setupSliders() {
  ['crispiness', 'softness', 'chewiness'].forEach(dim => {
    const slider = document.getElementById('slider-' + dim);
    slider.addEventListener('input', () => {
      document.getElementById('val-' + dim).textContent = slider.value;
    });
  });
}

// ---- SUBMIT RATING ----
function setupSubmit() {
  document.getElementById('btn-submit').addEventListener('click', () => {
    const name = document.getElementById('taster-name').value.trim();
    if (!name) {
      document.getElementById('taster-name').focus();
      document.getElementById('taster-name').style.borderColor = '#e74c3c';
      setTimeout(() => {
        document.getElementById('taster-name').style.borderColor = '';
      }, 2000);
      return;
    }
    if (!selectedFlour) return;

    localStorage.setItem('cookie-taster-name', name);

    const rating = createRating(
      name,
      selectedFlour.id,
      parseInt(document.getElementById('slider-crispiness').value),
      parseInt(document.getElementById('slider-softness').value),
      parseInt(document.getElementById('slider-chewiness').value)
    );

    if (!rating) return;

    ratings.push(rating);
    saveRatings();
    renderFlourGrid();
    showToast('toast');

    document.getElementById('rating-panel').classList.add('hidden');
    document.querySelectorAll('.flour-card').forEach(c => c.classList.remove('selected'));
    selectedFlour = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function saveRatings() {
  localStorage.setItem('cookie-ratings', JSON.stringify(ratings));
}

function showToast(id) {
  const toast = document.getElementById(id);
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

// ---- RESULTS VIEW ----
function refreshResults() {
  updateStats();
  renderChartGrid();
  renderLeaderboard();
  renderRatingsTable();
}

function updateStats() {
  document.getElementById('stat-tastings').textContent = ratings.length;

  const uniqueTasters = new Set(ratings.map(r => r.taster));
  document.getElementById('stat-tasters').textContent = uniqueTasters.size;

  if (ratings.length > 0) {
    const avgs = getAvgByFlour(ratings);
    const sorted = Object.entries(avgs).sort((a, b) => b[1].overall - a[1].overall);
    const topFlour = FLOURS.find(f => f.id === sorted[0][0]);
    document.getElementById('stat-leader').textContent = topFlour ? topFlour.name : '-';
  } else {
    document.getElementById('stat-leader').textContent = '-';
  }
}

function renderChartGrid() {
  const grid = document.getElementById('chart-grid');
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};
  grid.replaceChildren();

  const avgs = getAvgByFlour(ratings);

  FLOURS.forEach(f => {
    const avg = avgs[f.id];

    const card = document.createElement('div');
    card.className = 'chart-card';

    const title = document.createElement('h3');
    title.textContent = f.emoji + ' ' + f.name;

    const info = document.createElement('div');
    info.className = 'chart-count';
    info.textContent = avg.count + ' rating' + (avg.count !== 1 ? 's' : '') + ' \u00B7 Avg: ' + avg.overall;

    const canvas = document.createElement('canvas');
    canvas.id = 'chart-' + f.id;

    card.append(title, info, canvas);
    grid.appendChild(card);

    chartInstances[f.id] = new Chart(canvas.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['Crispiness', 'Softness', 'Chewiness'],
        datasets: [{
          label: f.name,
          data: [avg.crispiness, avg.softness, avg.chewiness],
          backgroundColor: CHART_COLORS[f.id].bg,
          borderColor: CHART_COLORS[f.id].border,
          borderWidth: 2,
          pointBackgroundColor: CHART_COLORS[f.id].border,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { stepSize: 2, display: false },
            pointLabels: { font: { size: 12, family: 'Fredoka', weight: '600' } },
            grid: { color: 'rgba(0,0,0,0.06)' },
            angleLines: { color: 'rgba(0,0,0,0.06)' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  });
}

function renderLeaderboard() {
  const board = document.getElementById('leaderboard');
  board.replaceChildren();
  const sorted = getLeaderboard(ratings);

  if (sorted.length === 0) {
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = 'No ratings yet!';
    board.appendChild(msg);
    return;
  }

  const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

  sorted.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'leader-row';

    const rank = document.createElement('span');
    rank.className = 'leader-rank';
    rank.textContent = medals[i] || String(i + 1);

    const name = document.createElement('span');
    name.className = 'leader-name';
    name.textContent = f.emoji + ' ' + f.name;

    const barContainer = document.createElement('div');
    barContainer.className = 'leader-bar-container';
    const bar = document.createElement('div');
    bar.className = 'leader-bar';
    bar.style.width = (f.overall / 10) * 100 + '%';
    bar.style.background = f.color;
    barContainer.appendChild(bar);

    const score = document.createElement('span');
    score.className = 'leader-score';
    score.textContent = String(f.overall);

    row.append(rank, name, barContainer, score);
    board.appendChild(row);
  });
}

function renderRatingsTable() {
  const tbody = document.getElementById('ratings-tbody');
  const msg = document.getElementById('no-ratings-msg');
  tbody.replaceChildren();

  if (ratings.length === 0) {
    msg.classList.remove('hidden');
    return;
  }

  msg.classList.add('hidden');

  ratings.slice().reverse().forEach(r => {
    const avg = Math.round(((r.crispiness + r.softness + r.chewiness) / 3) * 10) / 10;
    const flour = getFlourById(r.flour);
    const tr = document.createElement('tr');

    const tdTaster = document.createElement('td');
    tdTaster.textContent = r.taster;

    const tdFlour = document.createElement('td');
    tdFlour.textContent = (flour ? flour.emoji + ' ' : '') + r.flourName;

    const tdCrisp = document.createElement('td');
    tdCrisp.textContent = r.crispiness;

    const tdSoft = document.createElement('td');
    tdSoft.textContent = r.softness;

    const tdChewy = document.createElement('td');
    tdChewy.textContent = r.chewiness;

    const tdAvg = document.createElement('td');
    const strong = document.createElement('strong');
    strong.textContent = avg;
    tdAvg.appendChild(strong);

    const tdDel = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete-rating';
    delBtn.title = 'Delete';
    delBtn.textContent = '\u{1F5D1}';
    delBtn.addEventListener('click', () => {
      ratings = ratings.filter(x => x.id !== r.id);
      saveRatings();
      renderFlourGrid();
      refreshResults();
    });
    tdDel.appendChild(delBtn);

    tr.append(tdTaster, tdFlour, tdCrisp, tdSoft, tdChewy, tdAvg, tdDel);
    tbody.appendChild(tr);
  });
}

// ---- COMPARE VIEW ----
function refreshCompare() {
  renderCompareRadar();
  renderCompareBars();
  renderCompareInsights();
}

function renderCompareRadar() {
  if (compareChartInstance) compareChartInstance.destroy();

  const avgs = getAvgByFlour(ratings);
  const datasets = FLOURS
    .filter(f => avgs[f.id].count > 0)
    .map(f => ({
      label: f.name,
      data: [avgs[f.id].crispiness, avgs[f.id].softness, avgs[f.id].chewiness],
      backgroundColor: CHART_COLORS[f.id].bg,
      borderColor: CHART_COLORS[f.id].border,
      borderWidth: 2,
      pointBackgroundColor: CHART_COLORS[f.id].border,
      pointRadius: 4
    }));

  const ctx = document.getElementById('compare-radar').getContext('2d');
  compareChartInstance = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Crispiness', 'Softness', 'Chewiness'],
      datasets
    },
    options: {
      responsive: true,
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2 },
          pointLabels: { font: { size: 14, family: 'Fredoka', weight: '600' } },
          grid: { color: 'rgba(0,0,0,0.08)' },
          angleLines: { color: 'rgba(0,0,0,0.08)' }
        }
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 13, family: 'Nunito', weight: '600' }, padding: 16, usePointStyle: true }
        }
      }
    }
  });
}

function renderCompareBars() {
  const container = document.getElementById('compare-bars');
  container.replaceChildren();
  const avgs = getAvgByFlour(ratings);

  const dimensions = [
    { key: 'crispiness', label: 'Crispiness', css: 'crispy' },
    { key: 'softness', label: 'Softness', css: 'soft' },
    { key: 'chewiness', label: 'Chewiness', css: 'chewy' }
  ];

  dimensions.forEach(dim => {
    const card = document.createElement('div');
    card.className = 'compare-bar-card';

    const heading = document.createElement('h4');
    heading.textContent = dim.label;
    card.appendChild(heading);

    const floursSorted = FLOURS
      .filter(f => avgs[f.id].count > 0)
      .sort((a, b) => avgs[b.id][dim.key] - avgs[a.id][dim.key]);

    if (floursSorted.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty-msg';
      empty.textContent = 'No data yet';
      card.appendChild(empty);
    } else {
      floursSorted.forEach(f => {
        const val = avgs[f.id][dim.key];

        const row = document.createElement('div');
        row.className = 'bar-row';

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = f.emoji + ' ' + f.name;

        const track = document.createElement('div');
        track.className = 'bar-track';
        const fill = document.createElement('div');
        fill.className = 'bar-fill ' + dim.css;
        fill.style.width = (val / 10) * 100 + '%';
        track.appendChild(fill);

        const value = document.createElement('span');
        value.className = 'bar-value';
        value.textContent = String(val);

        row.append(label, track, value);
        card.appendChild(row);
      });
    }

    container.appendChild(card);
  });
}

function renderCompareInsights() {
  const container = document.getElementById('insights-cards');
  container.replaceChildren();
  const avgs = getAvgByFlour(ratings);
  const withData = FLOURS.filter(f => avgs[f.id].count > 0);

  if (withData.length < 2) {
    const msg = document.createElement('p');
    msg.className = 'empty-msg';
    msg.textContent = 'Rate at least 2 flour types to see insights!';
    container.appendChild(msg);
    return;
  }

  const scienceInsights = getInsights(ratings);

  const allInsights = scienceInsights.map(i => {
    const flour = getFlourById(i.flour);
    return {
      title: i.title,
      text: 'Scored ' + i.score + '/10 in ' + i.dimension + '. ' + (flour ? flour.science.split('.')[0] + '.' : '')
    };
  });

  // Extra insights: most extreme and balanced profiles
  const ranges = withData.map(f => {
    const vals = [avgs[f.id].crispiness, avgs[f.id].softness, avgs[f.id].chewiness];
    return { flour: f, range: Math.max(...vals) - Math.min(...vals) };
  }).sort((a, b) => b.range - a.range);

  if (ranges.length > 0) {
    allInsights.push({
      title: '\u{1F4CA} Most Extreme Profile: ' + ranges[0].flour.name,
      text: 'This flour had the biggest difference between its highest and lowest scores (range: ' + ranges[0].range.toFixed(1) + '), meaning it has a very distinct texture personality!'
    });
  }
  if (ranges.length > 1) {
    const balanced = ranges[ranges.length - 1];
    allInsights.push({
      title: '\u2696\uFE0F Most Balanced: ' + balanced.flour.name,
      text: 'With only a ' + balanced.range.toFixed(1) + ' point range across all dimensions, this flour produces the most evenly-textured cookie.'
    });
  }

  allInsights.push({
    title: '\u{1F52C} The Protein Connection',
    text: 'The protein content of flour directly affects gluten formation. More protein = more gluten = chewier cookies. Bread flour (12-14% protein) should be chewier than cake flour (5-8%). Does your data support this?'
  });

  allInsights.forEach(i => {
    const card = document.createElement('div');
    card.className = 'insight-card';

    const h4 = document.createElement('h4');
    h4.textContent = i.title;

    const p = document.createElement('p');
    p.textContent = i.text;

    card.append(h4, p);
    container.appendChild(card);
  });
}

// ---- NOTEBOOK ----
function setupNotebook() {
  document.getElementById('btn-save-notebook').addEventListener('click', () => {
    notebook = {
      hypothesis: document.getElementById('hypothesis-text').value,
      observations: document.getElementById('observations-text').value,
      conclusion: document.getElementById('conclusion-text').value
    };
    localStorage.setItem('cookie-notebook', JSON.stringify(notebook));
    showToast('notebook-toast');
  });

  const grid = document.getElementById('flour-info-grid');
  grid.replaceChildren();
  FLOURS.forEach(f => {
    const card = document.createElement('div');
    card.className = 'flour-info-card';
    card.style.setProperty('--flour-color', f.color);

    const h4 = document.createElement('h4');
    h4.textContent = f.emoji + ' ' + f.name;

    const p = document.createElement('p');
    p.textContent = f.science;

    card.append(h4, p);
    grid.appendChild(card);
  });
}

function loadNotebook() {
  if (notebook.hypothesis) document.getElementById('hypothesis-text').value = notebook.hypothesis;
  if (notebook.observations) document.getElementById('observations-text').value = notebook.observations;
  if (notebook.conclusion) document.getElementById('conclusion-text').value = notebook.conclusion;
}

// ---- EXPORT ----
function setupExport() {
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    if (ratings.length === 0) {
      alert('No ratings to export!');
      return;
    }
    const csv = ratingsToCSV(ratings);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cookie-science-results-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btn-clear-data').addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL ratings? This cannot be undone!')) {
      ratings = [];
      saveRatings();
      renderFlourGrid();
      refreshResults();
    }
  });
}
