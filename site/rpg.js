'use strict';
// Classic-MMORPG status windows for the evaluation results, plus title bars for every panel.
(function () {
  const BASE = 20891.5; // training-median baseline MAE (USD)
  // "Accuracy vs baseline": 100% = perfect, 0% = as bad as guessing the median. Log scale so both ends stay readable.
  const acc = err => Math.max(0, Math.min(100, (1 - Math.log10(err + 1) / Math.log10(BASE + 1)) * 100));
  const btns = '<span class="btns" aria-hidden="true"><i></i><i></i></span>';
  const title = (id, text) => `<div class="win-title" id="${id}"><span>${text}</span>${btns}</div>`;
  const gline = (tag, cls, pct, val, label) =>
    `<div class="gline"><span class="tag">${tag}</span><div class="gauge ${cls}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct.toFixed(1)}" aria-label="${esc(label)}"><i data-w="${pct.toFixed(2)}"></i></div><span class="val">${val}</span></div>`;

  // 1) Party status: seen vs unseen groups
  const party = $('#rpg-party');
  if (party) {
    const seen = 8.85, unseen = 11130;
    party.innerHTML = title('rpg-party-t', 'Party · Seen vs unseen models') + `
      <div class="unit"><div class="portrait" aria-hidden="true">S</div><div>
        <div class="who"><b>Seen models</b><span class="lv">Lv. 9,645</span></div>
        ${gline('ACC', 'hp', acc(seen), acc(seen).toFixed(0) + '%', 'Accuracy versus baseline for seen models')}
        ${gline('ERR', 'exp', seen / BASE * 100, '$' + fmt(seen, 2), 'Mean absolute error for seen models')}
        <span class="status-fx good">✦ Buff: model already seen in training</span></div></div>
      <div class="unit"><div class="portrait" aria-hidden="true">?</div><div>
        <div class="who"><b>Unseen models</b><span class="lv">Lv. 6</span></div>
        ${gline('ACC', 'low', acc(unseen), acc(unseen).toFixed(0) + '%', 'Accuracy versus baseline for unseen models')}
        ${gline('ERR', 'exp', unseen / BASE * 100, '$' + fmt(unseen), 'Mean absolute error for unseen models')}
        <span class="status-fx">⚠ Debuff: only 6 test records</span></div></div>
      <p class="foot">Lv = test records. ACC = accuracy vs guessing the median price ($${fmt(BASE, 0)} error), log scale.</p>`;
  }

  // 2) Character status: final test evaluation
  const st = $('#rpg-stats');
  if (st) {
    const rows = [['MAE', '$15.77'], ['RMSE', '$731.60'], ['Median err', '$0.30'], ['P90 err', '$1.90'], ['Baseline', '$20,891.50'], ['Test rows', '9,651']];
    st.innerHTML = title('rpg-stats-t', 'Status · Final test evaluation') + `
      ${gline('HP', 'hp', 99.91, 'R² 0.9991', 'R squared 0.9991')}
      ${gline('SP', 'sp', 99.93, '99.93%', 'Share of predictions within 1,000 dollars')}
      ${gline('EXP', 'exp', (1 - 15.77 / BASE) * 100, '−99.9% err', 'Error reduction versus baseline')}
      ${gline('DMG', 'low', 731.6 / BASE * 100, '$731.60', 'RMSE as share of baseline error')}
      <div class="stat-grid">${rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <p class="foot">HP = R² · SP = within $1,000 · EXP = error cut vs baseline · DMG = rare big misses (RMSE).</p>`;
  }

  // 3) Item window: recorded test example
  const it = $('#rpg-item');
  if (it) {
    const price = 42000, pred = 42004.074, miss = pred - price;
    it.innerHTML = title('rpg-item-t', 'Item · Recorded test example') + `
      <div class="item"><div class="slot"><img src="img/cars/bmw-i3.jpg" alt="BMW i3" loading="lazy" width="640" height="400"></div>
      <div class="desc"><div class="iname">BMW i3 · 2020 · PHEV</div>
        <div class="rarity">Test sample #1</div>
        ${gline('ATK', 'exp', 100, '$' + fmt(price), 'Dataset price')}
        ${gline('PRD', 'sp', 100, '$' + fmt(pred), 'Network prediction')}
        <div style="margin-top:8px">Miss by <span class="dmg miss">$${fmt(miss, 2)}</span></div>
      </div></div>
      <p class="foot">One saved example; photo is an earlier i3 for illustration.</p>`;
  }

  // Title bars on regular panels (use the panel's first heading)
  $$('.panel').forEach(p => {
    if (p.querySelector('.win-title')) return;
    const h = p.querySelector(':scope > h3') || p.querySelector(':scope > .kicker');
    const t = document.createElement('div');
    t.className = 'win-title';
    t.innerHTML = `<span>${h ? h.textContent : 'Window'}</span>${btns}`;
    if (h && h.tagName === 'H3') h.remove();
    p.prepend(t);
  });

  // Fill gauges when they scroll into view
  const fill = g => { g.style.width = g.dataset.w + '%'; };
  const gauges = $$('.gauge i');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { fill(e.target); io.unobserve(e.target); } }), { threshold: .3 });
    gauges.forEach(g => io.observe(g));
  } else gauges.forEach(fill);
})();
