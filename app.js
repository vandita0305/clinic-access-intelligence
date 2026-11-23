'use strict';

const study = window.clinicStudy;
const get = id => document.getElementById(id);
const fmt = x => x.toLocaleString('en-US');
const pct = (a, b) => (100 * a / b).toFixed(1) + '%';
const rate = study.missed / study.bookings;
get('hero-missed').textContent = fmt(study.missed);
get('hero-caption').textContent = 'of ' + fmt(study.bookings) + ' scheduled visits';
get('appointments').textContent = fmt(study.bookings);
get('rate').textContent = pct(study.missed, study.bookings);
get('slot-grid').innerHTML = Array.from({length: 100}, (_, i) =>
  '<span' + (i < Math.round(rate * 100) ? ' class="miss"' : '') + '></span>'
).join('');

function showLead(showRate) {
  get('show-count').setAttribute('aria-pressed', !showRate);
  get('show-rate').setAttribute('aria-pressed', showRate);
  const value = row => showRate ? row.missed / row.n : row.missed;
  const max = showRate ? 0.4 : Math.max(...study.lead.map(value));
  get('lead-chart').innerHTML = study.lead.map(row =>
    '<div class="row"><span>' + row.label + '</span><div class="track" aria-hidden="true"><i style="width:' +
    (100 * value(row) / max) + '%"></i></div><strong>' +
    (showRate ? pct(row.missed, row.n) : fmt(row.missed)) + '</strong></div>'
  ).join('');
  get('lead-note').textContent = showRate
    ? 'Rate = missed appointments divided by scheduled visits in the same band. The 31+ day band has the highest rate.'
    : 'The 1–7 day band accounts for 7,772 missed visits, the largest total of any booking lead-time band.';
}

const budget = get('budget');
budget.innerHTML = Object.keys(study.audit).map(value =>
  '<option value="' + value + '">' + value + '%</option>'
).join('');
budget.value = '10';

function showAudit() {
  const {model, baseline, ages} = study.audit[budget.value];
  const card = (label, result) => '<div><span>' + label + '</span><strong>' + fmt(result.hits) +
    '</strong><small>' + pct(result.hits, study.holdoutMisses) + ' of actual no-shows</small></div>';
  get('audit-head').innerHTML = card('Logistic model', model) + card('Lead-time baseline', baseline);
  get('audit-table').innerHTML =
    '<table class="audit-table"><thead><tr><th scope="col">Age band</th><th scope="col">Actual no-shows</th><th scope="col">Model recall</th><th scope="col">Baseline recall</th></tr></thead><tbody>' +
    ages.map(row => '<tr><th scope="row">' + row.label + '</th><td>' + fmt(row.missed) + '</td><td>' +
      pct(row.model, row.missed) + '</td><td>' + pct(row.baseline, row.missed) + '</td></tr>').join('') + '</tbody></table>';
  get('audit-note').textContent = fmt(model.reviewed) + ' bookings in each review queue. ' +
    (budget.value === '10'
      ? 'The model selected zero bookings for ages 40+. The baseline flagged 263 actual no-shows across those age bands.'
      : 'Recall is the share of actual no-shows the ranking flagged in each age band.');
}

function preview(audit) {
  get('tab-overview').setAttribute('aria-pressed', !audit);
  get('tab-audit').setAttribute('aria-pressed', audit);
  get('report-img').src = audit ? 'audit.png' : 'overview.png';
  get('report-img').alt = audit ? 'Visual preview of the Power BI outreach audit' : 'Visual preview of the Power BI overview';
}

get('show-count').addEventListener('click', () => showLead(false));
get('show-rate').addEventListener('click', () => showLead(true));
get('tab-overview').addEventListener('click', () => preview(false));
get('tab-audit').addEventListener('click', () => preview(true));
budget.addEventListener('change', showAudit);
showLead(false);
showAudit();
