'use strict';
// Top-20 models by number of price records: photo gallery linked to the explorer.
(function () {
  const cars = window.CARS || [];
  const host = $('#cars');
  if (!host || !cars.length) return;
  const maxN = Math.max(...cars.map(c => c.records));
  let sortKey = 'rank', picked = null;

  const spark = c => {
    const pts = c.trend; if (pts.length < 2) return '<svg class="spark" aria-hidden="true"></svg>';
    const ys = pts.map(p => p[1]), lo = Math.min(...ys), hi = Math.max(...ys);
    const x = i => 2 + i / (pts.length - 1) * 196, y = v => hi === lo ? 14 : 25 - (v - lo) / (hi - lo) * 22;
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join('');
    return `<svg class="spark" viewBox="0 0 200 28" preserveAspectRatio="none" aria-hidden="true"><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  };

  function render() {
    const list = [...cars].sort((a, b) => sortKey === 'rank' ? a.rank - b.rank
      : sortKey === 'high' ? b.median - a.median : a.median - b.median);
    host.innerHTML = list.map(c => `
      <button type="button" class="car" data-rank="${c.rank}" aria-pressed="${picked === c.rank}"
        aria-label="${esc(c.makeLabel + ' ' + c.label)}: median ${money(c.median)}, ${fmt(c.records)} records. Show in explorer">
        <figure><img src="${esc(c.img)}" alt="${esc(c.makeLabel + ' ' + c.label)}" loading="lazy" width="640" height="400">
          <span class="rank">#${c.rank}</span><span class="chip">${esc(c.type)}</span></figure>
        <div class="body">
          <div class="name"><small>${esc(c.makeLabel)}</small>${esc(c.label)}</div>
          <div class="kv"><span>Median price<b>${money(c.median)}</b></span><span>Records<b>${fmt(c.records)}</b></span></div>
          <div class="meter" title="Records relative to the most common model"><i style="width:${c.records / maxN * 100}%"></i></div>
          ${spark(c)}
          <span class="caption" style="font-size:12px">Median by year · ${c.years[0]}–${c.years[1]}</span>
        </div>
      </button>`).join('');
  }

  host.addEventListener('click', e => {
    const b = e.target.closest('.car'); if (!b) return;
    const c = cars.find(x => x.rank === +b.dataset.rank);
    picked = picked === c.rank ? null : c.rank;
    $('#type').value = ''; $('#year').value = '';
    $('#make').value = picked ? c.make : '';
    $('#make').dispatchEvent(new Event('change'));
    if (picked) {
      // choose this model's largest group in the lookup
      const opts = [...$('#group').options];
      let best = null, bestN = -1;
      opts.forEach(o => { const label = o.textContent; if (label.startsWith(c.make + ' ' + c.model + ' ·')) {
        const g = data.groups.find(g => `${g.make} ${g.model} · ${g.year ?? 'Unknown year'} · ${g.type}` === label);
        if (g && g.n > bestN) { bestN = g.n; best = o.value; } } });
      if (best !== null) { $('#group').value = best; $('#group').dispatchEvent(new Event('change')); }
      $('#explorer').scrollIntoView({ behavior: 'smooth' });
    }
    render();
  });
  $$('.gallery-sort button').forEach(b => b.addEventListener('click', () => {
    sortKey = b.dataset.sort;
    $$('.gallery-sort button').forEach(x => x.setAttribute('aria-pressed', x === b));
    render();
  }));
  $('#reset').addEventListener('click', () => { picked = null; render(); });
  render();

  $('#credits-list').innerHTML = cars.map(c =>
    `<li>${esc(c.makeLabel + ' ' + c.label)}: <a href="${esc(c.credit.source)}" target="_blank" rel="noopener">${esc(c.credit.author || 'Wikimedia Commons')}</a>, ${esc(c.credit.license)}</li>`).join('');
})();
