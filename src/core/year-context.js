import { SajuError } from './error.js';
import { BRANCHES, STEMS } from './ganji.js';
const POSITIONS = ['year','month','day','hour'];

function validatePillar(pillar, key) {
  const si = STEMS.indexOf(pillar?.stem);
  const bi = BRANCHES.indexOf(pillar?.branch);
  if (si < 0 || bi < 0 || si % 2 !== bi % 2 || pillar.text !== pillar.stem + pillar.branch) {
    throw new SajuError('pillar', key + ' 간지가 올바르지 않습니다.');
  }
}

function validateDaeun(daeun) {
  if (!Array.isArray(daeun?.pillars) || daeun.pillars.length !== 10) {
    throw new SajuError('daeun-input', '10개 대운 구간이 필요합니다.');
  }
  let previous = null;
  for (const band of daeun.pillars) {
    validatePillar(band, '대운');
    if (!Number.isInteger(band.fromYear) || !Number.isInteger(band.toYear)
        || band.toYear - band.fromYear !== 9
        || (previous && band.fromYear !== previous.toYear + 1)) {
      throw new SajuError('daeun-input', '대운 구간은 겹침 없이 연속한 10년이어야 합니다.');
    }
    previous = band;
  }
}

export function prepareYearContext({saju,daeun,year},getSeun){
  const seun = getSeun(year);
  for (const position of POSITIONS) {
    const pillar = saju?.pillars?.[position];
    if (position === 'hour' && pillar == null) continue;
    validatePillar(pillar, '원국 ' + position);
  }
  validateDaeun(daeun);
  const bands = daeun.pillars;
  const band = bands.find((item) => item.fromYear <= year && year <= item.toYear);
  if (!band && year > bands[bands.length - 1].toYear) {
    throw new SajuError('daeun-range', '대운 계산 구간 이후의 연도입니다.');
  }
  return {seun,bands,band};
}
