const CACHE_KEY = 'jalwa_history';

export async function fetchLiveHistory(limit = 200) {
  // 1) try cache first
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) return JSON.parse(cached);

  // 2) fetch from Cloudflare Worker (or your own endpoint)
  const res = await fetch('https://jalwa-api.example.com/history?limit=' + limit);
  const json = await res.json();

  localStorage.setItem(CACHE_KEY, JSON.stringify(json));
  return json;
}

export function buildCharts(history) {
  const labels = history.map((_, i) => i);
  const numbers = history.map(h => h.number);
  new Chart(document.getElementById('historyChart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Drawn Number',
        data: numbers,
        borderColor: '#00ffe7',
        tension: 0.3,
        pointRadius: 2
      }]
    },
    options: { scales: { y: { min: 0, max: 9 } } }
  });
}
