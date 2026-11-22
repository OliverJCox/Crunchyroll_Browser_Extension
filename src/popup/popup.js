import { fetchWatchHistory } from '../utils/api.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const history = await fetchWatchHistory(100);
    console.log('Watch History Array:', history);
  } catch (err) {
    console.error(err.message);
  }
});