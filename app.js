import { loadModel, predictNext } from './ml.js';
import { fetchLiveHistory, buildCharts } from './data.js';

const last4Input = document.getElementById('last4');
const goBtn       = document.getElementById('go');
const loader      = document.getElementById('loader');
const result      = document.getElementById('result');

let lstmModel, history;

(async () => {
  lstmModel = await loadModel();
  history   = await fetchLiveHistory(200);   // last 200 games
  buildCharts(history);
})();

goBtn.onclick = async () => {
  const last4 = last4Input.value.trim();
  if (!/^\d{4}$/.test(last4)) { alert('Enter 4 digits'); return; }
  loader.classList.remove('hidden');
  result.classList.add('hidden');

  const next  = await predictNext(lstmModel, history, last4);
  document.getElementById('nextPeriod').textContent = next.period;
  document.getElementById('predNum').textContent     = next.number;
  document.getElementById('predBigSmall').textContent= next.bigSmall;
  document.getElementById('predColour').textContent  = next.colour;

  buildConfidenceChart(next.probs);
  loader.classList.add('hidden');
  result.classList.remove('hidden');
};

function buildConfidenceChart(probs) {
  const ctx = document.getElementById('confidenceChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red','Green','Violet','Big','Small'],
      datasets: [{ data: probs, backgroundColor: ['#ff5252','#4caf50','#9c27b0','#ffeb3b','#2196f3'] }]
    },
    options: { plugins: { legend: { display: false } } }
  });
}
