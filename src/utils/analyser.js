// Performs analysis on the raw data received from Crunchyroll's server 


export function analyseWatchHistory(historyItems) {
  if (!Array.isArray(historyItems) || historyItems.length === 0) {
    return {
    totalHours: 0,
    totalEpisodes: 0,
    uniqueShows: 0,
    topShows: [],
    audioBreakdown: { sub: 0, dub: 0 },
    dayOfWeekCounts: [0, 0, 0, 0, 0, 0, 0], // Sun -> Sat
    genres: [],
    lastWatched: ""
    };
  }

  let totalSeconds = 0;
  const showCounts = {};
  const audioBreakdown = { sub: 0, dub: 0 };
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  const genreCounts = {};
  let lastWatched = 'Unknown'

  // Get last fully watched episode
  for (let i = 0; i < historyItems.length; i++) {
      if (historyItems[i].fully_watched) {
      lastWatched = historyItems[i].panel?.title || 'Unknown';
      break
    }
  }

  historyItems.forEach(item => {
    const meta = item.panel?.episode_metadata || {};

    // 1. Accumulate watch time (fallback to full duration if playhead is 0/missing)
    const secondsWatched = item.playhead || Math.round((meta.duration_ms || 0) / 1000);
    totalSeconds += secondsWatched;

    // 2. Group episodes by series title
    const seriesTitle = meta.series_title || 'Unknown Series';
    showCounts[seriesTitle] = (showCounts[seriesTitle] || 0) + 1;

    // 3. Track Sub (ja-JP) vs Dub (anything else)
    if (meta.audio_locale === 'ja-JP') {
      audioBreakdown.sub += 1;
    } 
    else if (meta.audio_locale) {
      audioBreakdown.dub += 1;
    }

    // 4. Track which day of the week the episode was watched
    if (item.date_played) {
      const dayIndex = new Date(item.date_played).getDay(); // 0 = Sunday, 6 = Saturday
      dayOfWeekCounts[dayIndex] += 1;
    }

    // 5. Group episodes by genre
    const genre = meta.tenant_categories || 'Unknown Genre';
    if (Array.isArray(genre)) {
      genre.forEach(item => {
      genreCounts[item] = (genreCounts[item] || 0) + 1;
      })
    }
    else {
      genreCounts['Unknown Genre'] = (genreCounts['Unknown Genre'] || 0) + 1;
    }
  });

  // Sort shows by episode count descending and take top 5
  const topShows = Object.entries(showCounts)
  .map(([title, count]) => ({title: title, count: count}))
  // Compares each item in the array, subtracts the two and if result positive swaps them
  .sort((a, b) => b.count - a.count) 
  .slice(0, 5);

  // Sort genres by episode count
  const genres = Object.entries(genreCounts)
  .map(([name, count]) => ({name: name, count: count}))
  // Compares each item in the array, subtracts the two and if result positive swaps them
  .sort((a, b) => b.count - a.count) 


  return {
    totalHours: Number((totalSeconds / 3600).toFixed(1)),
    totalEpisodes: historyItems.length,
    uniqueShows: Object.keys(showCounts).length,
    topShows,
    audioBreakdown,
    dayOfWeekCounts,
    genres,
    lastWatched
  };
}

export function applyFilters(analysedHistory) {

}
