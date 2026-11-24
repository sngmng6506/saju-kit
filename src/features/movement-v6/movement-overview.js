/**
 * Personal relative signal visualization. Raw movement scores are unchanged.
 * These are within-person display indices, not relocation probabilities.
 */
export function analyzeMovementTimeline(years) {
  if (!Array.isArray(years) || !years.length) throw new TypeError('분석할 연도 목록이 필요합니다.');
  const scores = years.map((row, index) => {
    if (!Number.isInteger(row?.year) || !Number.isInteger(row?.display?.score) || row.display.score < 0)
      throw new TypeError('연도별 원점수가 올바르지 않습니다.');
    if (index && row.year !== years[index - 1].year + 1)
      throw new TypeError('연도는 연속되어야 합니다.');
    return row.display.score;
  });
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const hasContrast = max > min;
  // Avoid treating a flat (even nonzero) timeline as a compelling peak.
  const relative = scores.map(score => hasContrast ? Math.round(100 * (score - min) / (max - min)) : 0);
  const threshold = Math.max(Math.ceil(max * .7), 1);
  const spans = [];
  if (hasContrast) {
    let start = -1;
    for (let i = 0; i <= years.length; i += 1) {
      const qualifying = i < years.length && scores[i] >= threshold;
      if (qualifying && start < 0) start = i;
      if ((!qualifying || i === years.length) && start >= 0) {
        let peakIndex = start;
        let sum = 0;
        for (let j = start; j < i; j += 1) {
          sum += scores[j];
          if (scores[j] > scores[peakIndex]) peakIndex = j;
        }
        spans.push({
          fromYear: years[start].year,
          toYear: years[i - 1].year,
          startIndex: start,
          endIndex: i - 1,
          peakIndex,
          peakYear: years[peakIndex].year,
          peakRaw: scores[peakIndex],
          peakRelative: relative[peakIndex],
          sum,
        });
        start = -1;
      }
    }
  }
  // Independent spans only; deterministic ranking with chronological tie break.
  spans.sort((a, b) => b.peakRaw - a.peakRaw || b.sum - a.sum || a.fromYear - b.fromYear);
  return {
    minRaw: min,
    maxRaw: max,
    hasContrast,
    relative,
    threshold,
    highlights: spans,
  };
}
