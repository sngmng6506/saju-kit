/**
 * 한국 벽시계가 협정세계시+9가 아니었던 구간.
 * 표준시 전이는 1908-04-01 +8:30, 1912-01-01 +9, 1954-03-21 +8:30, 1961-08-10 +9.
 * 서머타임 구간은 IANA tz database Asia/Seoul 이다.
 * 이 모듈은 그 구간에서 두 해석의 연주·월주가 갈리는지만 본다. 보정을 적용하지는 않는다.
 */

const STANDARD_EPOCHS = [
  { year: 1908, month: 4, day: 1, offsetMin: 510 },
  { year: 1912, month: 1, day: 1, offsetMin: 540 },
  { year: 1954, month: 3, day: 21, offsetMin: 510 },
  { year: 1961, month: 8, day: 10, offsetMin: 540 },
];

const DST_INTERVALS = [
  { start: [1948, 6, 1, 0], end: [1948, 9, 13, 0] },
  { start: [1949, 4, 3, 0], end: [1949, 9, 11, 0] },
  { start: [1950, 4, 1, 0], end: [1950, 9, 10, 0] },
  { start: [1951, 5, 6, 0], end: [1951, 9, 9, 0] },
  { start: [1955, 5, 5, 0], end: [1955, 9, 9, 0] },
  { start: [1956, 5, 20, 0], end: [1956, 9, 30, 0] },
  { start: [1957, 5, 5, 0], end: [1957, 9, 22, 0] },
  { start: [1958, 5, 4, 0], end: [1958, 9, 21, 0] },
  { start: [1959, 5, 3, 0], end: [1959, 9, 20, 0] },
  { start: [1960, 5, 1, 0], end: [1960, 9, 18, 0] },
  { start: [1987, 5, 10, 2], end: [1987, 10, 11, 3] },
  { start: [1988, 5, 8, 2], end: [1988, 10, 9, 3] },
];

function key(year, month, day, hour) {
  return ((year * 12 + (month - 1)) * 31 + (day - 1)) * 24 + hour;
}

function standardOffsetMin(year, month, day) {
  const current = key(year, month, day, 0);
  let offset = 540;
  for (const epoch of STANDARD_EPOCHS) {
    if (current >= key(epoch.year, epoch.month, epoch.day, 0)) offset = epoch.offsetMin;
    else break;
  }
  return offset;
}

function isDst(year, month, day, hour) {
  const current = key(year, month, day, hour);
  return DST_INTERVALS.some((interval) => {
    const [sy, sm, sd, sh] = interval.start;
    const [ey, em, ed, eh] = interval.end;
    return current >= key(sy, sm, sd, sh) && current < key(ey, em, ed, eh);
  });
}

/** 벽시계 시각의 법정 UTC 오프셋(분). 서머타임이면 60을 더한다. */
export function koreaOffsetMin(year, month, day, hour) {
  return standardOffsetMin(year, month, day) + (isDst(year, month, day, hour) ? 60 : 0);
}
