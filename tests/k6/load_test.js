import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const ASSET_COUNT = 10000;
const USER_COUNT = 1000000;

const HOST = 'app'

// Frequency of the different actions
const SEARCH_WEIGHT = 0.7;
const HISTORY_WEIGHT = 0.2;
const TRENDS_WEIGHT = 0.1;

const searchCounter = new Counter('search_requests');
const historyCounter = new Counter('history_requests');
const trendsCounter = new Counter('trends_requests');

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

// Main function for k6
export default function () {
  const userId = randomInt(USER_COUNT) + 1;
  const assetId = randomInt(ASSET_COUNT) + 1;
  const actionDie = randomInt(100);

  let action = 2;
  if (actionDie < SEARCH_WEIGHT * 100) {
    action = 0;
  } else if (actionDie < (SEARCH_WEIGHT + HISTORY_WEIGHT) * 100) {
    action = 1;
  }

  if (action === 0) { // Perform a search
    const url = `http://${HOST}:3000/search`;
    const payload = JSON.stringify({
      user: userId,
      asset: assetId
    });
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = http.post(url, payload, params);
    check(res, {
      'search successful': (r) => r.status === 200,
    });
    searchCounter.add(1);
  } else if (action === 1) { // Request search history
    const url = `http://${HOST}:3000/search?user=${userId}`;
    const res = http.get(url);
    check(res, {
      'history request successful': (r) => r.status === 200,
    });
    historyCounter.add(1);
  } else if (action === 2) { // Request trends
    const url = `http://${HOST}:3000/trends`;
    const res = http.get(url);
    check(res, {
      'trends request successful': (r) => r.status === 200,
    });
    trendsCounter.add(1);
  }

  sleep(0.1); // Simulate user think time
}
