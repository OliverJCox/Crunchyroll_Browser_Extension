import { fetchWatchHistory } from '../utils/api.js';
import { analyseWatchHistory } from '../utils/analyser.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const rawHistory = await fetchWatchHistory(100);
    console.log("Raw stats object: ", rawHistory);
    const stats = analyseWatchHistory(rawHistory);
    console.log('Cleaned stats object:', stats);
  } catch (err) {
    console.error('Error:', err.message);
  }
});
