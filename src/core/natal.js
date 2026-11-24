import { stemIndex, branchIndex, stemInfo, branchElement } from './elements.js';
import { SajuError } from './error.js';
import { getHiddenStems, HIDDEN_STEMS_VERSION } from './hidden-stems.js';

// Fixed, visible-stem/branch correspondences. These are not weighted strengths.
const TEN_GODS = [
  ['비견', '겁재'], // same element
  ['식신', '상관'], // day master produces target
  ['편재', '정재'], // day master controls target
  ['편관', '정관'], // target controls day master
  ['편인', '정인'], // target produces day master
];
const POSITIONS = ['year', 'month', 'day', 'hour'];

function validatePillar(pillar, position) {
  if (!pillar || typeof pillar !== 'object' || Array.isArray(pillar)) {
    throw new SajuError('pillar', position + ' 간지가 없습니다.');
  }
  const si = stemIndex(pillar.stem);
  const bi = branchIndex(pillar.branch);
  if (si % 2 !== bi % 2 || pillar.text !== pillar.stem + pillar.branch) {
    throw new SajuError('pillar', position + ' 간지가 60갑자 규칙과 일치하지 않습니다.');
  }
}

/** Standard ten-god relation for a visible heavenly stem relative to the day stem. */
export function tenGodForStem(dayStem, targetStem) {
  const day = stemIndex(dayStem);
  const target = stemIndex(targetStem);
  const dayElement = Math.floor(day / 2);
  const targetElement = Math.floor(target / 2);
  const relation = (targetElement - dayElement + 5) % 5;
  const polarity = day % 2 === target % 2 ? 0 : 1;
  return TEN_GODS[relation][polarity];
}

/**
 * Descriptive natal chart structure, not a fortune score or a strong/weak ruling.
 * Without birth hour, counts cover six visible characters (not eight).
 */
export function analyzeNatalStructure({ saju } = {}) {
  const pillars = saju?.pillars;
  if (!pillars || typeof pillars !== 'object' || Array.isArray(pillars)) {
    throw new SajuError('saju-input', '만세력의 연월일주가 필요합니다.');
  }
  for (const position of POSITIONS) {
    const pillar = pillars[position];
    if (position === 'hour' && pillar === null) continue;
    validatePillar(pillar, position);
  }
  const dayMaster = { stem: pillars.day.stem, ...stemInfo(pillars.day.stem) };
  const elementCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const resultPillars = {};
  for (const position of POSITIONS) {
    const pillar = pillars[position];
    if (pillar === null) {
      resultPillars[position] = null;
      continue;
    }
    const stem = stemInfo(pillar.stem);
    const branch = {
      element: branchElement(pillar.branch),
      hiddenStems: getHiddenStems(pillar.branch).map((item) => ({
        ...item,
        tenGod: tenGodForStem(dayMaster.stem, item.stem),
      })),
    };
    elementCounts[stem.element] += 1;
    elementCounts[branch.element] += 1;
    resultPillars[position] = {
      stem: { ...stem, tenGod: tenGodForStem(dayMaster.stem, pillar.stem) },
      branch,
    };
  }
  return {
    dayMaster,
    pillars: resultPillars,
    elementCounts,
    metadata: {
      basis: 'visible-stems-and-branches-v1',
      completeHour: pillars.hour !== null,
      hiddenStemsBasis: HIDDEN_STEMS_VERSION,
    },
  };
}

/**
 * Literal matching stem occurrences inside the chart's branches, without
 * deciding rootedness strength, seasonal support or auspiciousness.
 */
export function findHiddenStemOccurrences({ saju, stem } = {}) {
  stemIndex(stem);
  const pillars = saju?.pillars;
  if (!pillars || typeof pillars !== 'object' || Array.isArray(pillars)) {
    throw new SajuError('saju-input', '만세력의 연월일주가 필요합니다.');
  }
  const matches = [];
  for (const position of POSITIONS) {
    const pillar = pillars[position];
    if (position === 'hour' && pillar === null) continue;
    validatePillar(pillar, position);
    for (const entry of getHiddenStems(pillar.branch)) {
      if (entry.stem === stem) {
        matches.push({ position, branch: pillar.branch, stem, role: entry.role });
      }
    }
  }
  return matches;
}
