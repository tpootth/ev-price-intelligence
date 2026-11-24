'use strict';
// Classic-MMORPG status windows for the evaluation results, plus title bars for every panel.
(function () {
  const BASE = 20891.5; // training-median baseline MAE (USD)
  const btns = '<span class="btns" aria-hidden="true"><i></i><i></i></span>';
  const title = (id, text) => `<div class="win-title" id="${id}"><span>${text}</span>${btns}</div>`;
  const gline = (tag, cls, pct, val, label) =>
    `<div class="gline"><span class="tag">${tag}</span><div class="gauge ${cls}" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct.toFixed(1)}" aria-label="${esc(label)}"><i data-w="${pct.toFixed(2)}"></i></div><span class="val">${val}</span></div>`;

  // 1) Party window: seen vs unseen. One honest gauge: error as a share of the naive guess.
  const party = $('#rpg-party');
  if (party) {
    const unit = (icon, name, lv, err, cls, fx, fxCls) => `
      <div class="unit"><div class="portrait" aria-hidden="true">${icon}</div><div>
        <div class="who"><b>${name}</b><span class="lv">Lv. ${lv}</span></div>
        <div class="bignum">$${fmt(err, err < 100 ? 2 : 0)}<small>average miss</small></div>
        ${gline('ERR', cls, err / BASE * 100, (err / BASE * 100).toFixed(err / BASE < .01 ? 2 : 0) + '%', 'Error as a share of the naive guess')}
        <span class="status-fx ${fxCls}">${fx}</span></div></div>`;
    party.innerHTML = title('rpg-party-t', 'Party · Seen vs unseen models') +
      unit('✓', 'Seen models', '9,645', 8.85, 'hp', '✦ Buff · already met in training', 'good') +
      unit('?', 'Unseen models', '6', 11130, 'low', '⚠ Debuff · only 6 test records', '') +
      `<p class="explain">The bar shows error against a naive guess (always the median price, $${fmt(BASE, 0)} off). Shorter is better. On known models the network is almost exact. On new models it still misses by about half the naive error.</p>`;
  }

  // 2) Status window: two meaningful gauges, the rest as stats and a plain explanation.
  const st = $('#rpg-stats');
  if (st) {
    const rows = [['MAE', '$15.77'], ['Median miss', '$0.30'], ['90% of misses ≤', '$1.90'], ['RMSE', '$731.60'], ['Naive guess', '$20,891.50'], ['Test rows', '9,651']];
    st.innerHTML = title('rpg-stats-t', 'Status · Final test evaluation') + `
      ${gline('HP', 'hp', 99.91, 'R² 0.9991', 'R squared 0.9991')}
      ${gline('SP', 'sp', 99.93, '99.93%', 'Share of predictions within 1,000 dollars')}
      <div class="stat-grid">${rows.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <p class="explain"><b>HP</b> = how much price variation the model explains. <b>SP</b> = predictions within $1,000. Typical misses are cents, but RMSE ($731.60) shows a few large misses still happen.</p>`;
  }

  // 3) Item window: a price card instead of two identical full bars.
  const it = $('#rpg-item');
  if (it) {
    const price = 42000, pred = 42004.074;
    it.innerHTML = title('rpg-item-t', 'Item · Recorded test example') + `
      <div class="item"><div class="slot"><img src="img/cars/bmw-i3.jpg" alt="BMW i3" loading="lazy" width="640" height="400"></div>
      <div class="desc"><div class="iname">BMW i3 · 2020 · PHEV</div>
        <div class="rarity">Test sample #1</div>
        <div class="price-pair"><div><small>Dataset price</small><b>$${fmt(price)}</b></div><div><small>Network says</small><b>$${fmt(pred)}</b></div></div>
        <div class="miss-row">Miss <span class="dmg miss">$${fmt(pred - price, 2)}</span></div>
      </div></div>
      <p class="explain">One saved example from the test set: the prediction lands within a few dollars. Photo shows an earlier i3 for illustration.</p>`;
  }

  // Validation: a leaderboard reads better than three nearly identical bars
  const val = $('#validation');
  if (val && data.validation) {
    const rows = [...data.validation].sort((a, b) => a.maeUSD - b.maeUSD), worst = rows[rows.length - 1].maeUSD;
    const medal = ['🥇', '🥈', '🥉'];
    val.innerHTML = `<ol class="board">${rows.map((r, i) => `<li${i === 0 ? ' class="win"' : ''}><span class="m" aria-hidden="true">${medal[i] || i + 1}</span><span class="n">${esc(r.name)}${i === 0 ? ' <em>chosen</em>' : ''}</span><b>$${fmt(r.maeUSD, 2)}</b><small>${i === rows.length - 1 ? 'reference' : '−' + ((1 - r.maeUSD / worst) * 100).toFixed(1) + '%'}</small></li>`).join('')}</ol>`;
    const cap = val.previousElementSibling;
    if (cap && cap.classList.contains('caption')) cap.textContent = 'Validation error (MAE, USD) · lower wins.';
    val.insertAdjacentHTML('afterend', '<p class="caption" style="margin:0 0 -12px">Data split · train / validation / test</p>');
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
