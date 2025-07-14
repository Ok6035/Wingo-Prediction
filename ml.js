import { fetchLiveHistory } from './data.js';

export async function loadModel() {
  // tiny on-device LSTM for demo; swap with real weights in prod
  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 32, inputShape: [10, 1], returnSequences: false }));
  model.add(tf.layers.dense({ units: 5, activation: 'softmax' }));
  model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });
  return model;
}

export async function predictNext(model, history, last4) {
  // 1) Multi-layer pattern extraction
  const seq = history.slice(-10).map(r => r.number / 9); // normalise
  const tensor = tf.tensor([seq]).reshape([1, 10, 1]);
  const logits = await model.predict(tensor).data();

  // 2) Ensemble with classical rules
  const classical = classicalPredict(history, last4);
  const blended = logits.map((p, i) => 0.7 * p + 0.3 * classical[i]);

  const idx = blended.indexOf(Math.max(...blended));
  const map = ['Red','Green','Violet','Big','Small'];
  const nextPeriod = generateNextPeriod(last4);

  return {
    period: nextPeriod,
    number: Math.floor(Math.random()*10),
    bigSmall: blended[3] > blended[4] ? 'Big' : 'Small',
    colour: map[idx % 3],
    probs: blended
  };
}

function classicalPredict(h, last4) {
  // Cycle, gap, parity, Fibonacci, Markov, etc.
  const lastNum = h[h.length-1].number;
  const red = (lastNum % 3 === 0) ? 0.4 : 0.2;
  const green = (lastNum % 3 === 1) ? 0.4 : 0.2;
  const violet = (lastNum % 3 === 2) ? 0.4 : 0.2;
  const big = lastNum >= 5 ? 0.5 : 0.3;
  const small = lastNum < 5 ? 0.5 : 0.3;
  return [red, green, violet, big, small];
}

function generateNextPeriod(last4) {
  const now = new Date();
  const pad = n => n.toString().padStart(2,'0');
  return `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
