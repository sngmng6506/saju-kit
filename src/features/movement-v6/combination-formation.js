import { branchPairRelations, branchGroupDefinitions } from '../../core/relations.js';
const isClash = (a,b) => branchPairRelations(a,b).some(signal => signal.type === 'branch.clash');

// Preserve the movement-v6 iteration order and legacy Korean labels.
const groups = branchGroupDefinitions();
const names = {water:'수',fire:'화',metal:'금',wood:'목'};
function definitions(source, order, suffix) {
  return Object.freeze(order.map(element => {
    const group = source.find(item => item.element === element);
    return Object.freeze({ name: group.branches.join('')+' '+names[element]+suffix, branches: Object.freeze(group.branches.slice()) });
  }));
}
export const COMBINATION_GROUPS = Object.freeze({
  SAMHAP: definitions(groups.three,['water','fire','metal','wood'],'국'),
  BANGHAP: definitions(groups.seasonal,['wood','fire','metal','water'],'방합'),
});

function counts(group, available) {
  return group.branches.filter(branch => available.has(branch)).length;
}

// A two-branch samhap is banhap only when its king branch is present.
// Its two outer branches without the king branch remain non-scoring gahap.
function halfPair(group, available) {
  const pair = group.branches.filter(branch => available.has(branch));
  return pair.length === 2 && pair.includes(group.branches[1]) ? pair : null;
}

function detailsFor(group, natal, band, seun) {
  return {
    group: group.name, branches: [...group.branches],
    natalBranches: Object.fromEntries(
      ['year','month','day','hour'].filter(key => natal[key]?.branch && group.branches.includes(natal[key].branch))
        .map(key => [key, natal[key].branch])),
    daeunBranch: band?.branch ?? null,
    seunBranch: seun.branch,
  };
}

/**
 * Only month/day-anchored three-branch sets. Strictly set-theoretic detection:
 * no implied 化, 투간, 월령 세력, or forecast of actual relocation.
 *
 * Daeun formation is emitted once, in the new band's first year, and only
 * when natal+new band completes a set absent from natal+previous band.
 * Seun formation requires an incomplete natal+current-band baseline and
 * completion by the annual branch; it is valid in ANY year, not just transitions.
 * Same completed set cannot be emitted by both mechanisms in one year.
 */
export function getCombinationSignals({ natal, band, previousBand, seun, year }) {
  if (!natal?.month?.branch || !natal?.day?.branch || !seun?.branch || !Number.isInteger(year)) {
    throw new TypeError('원국 월지·일지, 세운 지지, 연도가 필요합니다.');
  }
  const natalSet = new Set(['year','month','day','hour'].map(key => natal[key]?.branch).filter(Boolean));
  const base = new Set(natalSet);
  if (band) base.add(band.branch);
  const previous = new Set(natalSet);
  if (previousBand) previous.add(previousBand.branch);
  const withSeun = new Set(base);
  withSeun.add(seun.branch);
  const atTransition = Boolean(band && year === band.fromYear);
  const signals = [];
  for (const [type, groups] of Object.entries(COMBINATION_GROUPS)) {
    for (const group of groups) {
      // The relevant group must touch at least one of month or day.
      if (![natal.month.branch, natal.day.branch].some(branch => group.branches.includes(branch))) continue;
      const beforeCount = counts(group, previous);
      const baseCount = counts(group, base);
      const currentCount = counts(group, withSeun);
      const previousHalf = type === 'SAMHAP' ? halfPair(group, previous) : null;
      const baseHalf = type === 'SAMHAP' ? halfPair(group, base) : null;
      const currentHalf = type === 'SAMHAP' ? halfPair(group, withSeun) : null;
      const seunCompletes = baseCount < 3 && currentCount === 3 && group.branches.includes(seun.branch);
      const common = detailsFor(group, natal, band, seun);
      const emit = (suffix, source, extra = {}) => {
        // Observational quality facts, not a determination of 合化.
        const natalPositions = ['year', 'month', 'day', 'hour'].map(p => natal[p]?.branch);
        const relevant = suffix === 'BANHAP' ? extra.pair : group.branches;
        const adjacentNatal = natalPositions.some((branch, index) => index < 3 && relevant.includes(branch)
          && relevant.includes(natalPositions[index + 1]));
        const kingInMonth = natal.month.branch === group.branches[1];
        const interruptedBySeun = source === 'DAEUN' && group.branches.some(branch => isClash(seun.branch, branch));
        const quality = suffix === 'FORMED' || suffix === 'BANHAP'
          ? { kingInMonth, adjacentNatal, interruptedBySeun,
              grade: kingInMonth && adjacentNatal ? 'reinforced' : kingInMonth || adjacentNatal ? 'supported' : 'basic' }
          : null;
        signals.push({ key: `${source}_${type}_${suffix}`, source: source === 'DAEUN' ? 'daeun' : 'calendar',
          target: source === 'DAEUN' ? 'daeun' : 'year',
          relation: type.toLowerCase(), details: { ...common, ...extra, ...(quality ? { quality } : {}) } });
      };

      if (atTransition && beforeCount < 3 && baseCount === 3 && group.branches.includes(band.branch)) {
        emit('FORMED', 'DAEUN', { triggerBranch: band.branch, effectiveYear: year });
      } else if (atTransition && beforeCount === 3 && baseCount === 3) {
        // Informational only, and only at transitions (not every year).
        emit('MAINTAINED', 'DAEUN', { effectiveYear: year });
      } else if (atTransition && beforeCount < 3 && baseCount === 2
          && group.branches.includes(band.branch) && baseHalf
          && baseHalf.join(':') !== previousHalf?.join(':') && !seunCompletes) {
        // Score only a newly established king-branch pair on the transition.
        // When seun completes the same whole group, count that instead.
        emit('BANHAP', 'DAEUN', { triggerBranch: band.branch, pair: [...baseHalf],
          wangji: group.branches[1], effectiveYear: year });
      } else if (atTransition && beforeCount < 2 && baseCount === 2 && group.branches.includes(band.branch)) {
        emit('PARTIAL', 'DAEUN', { triggerBranch: band.branch, effectiveYear: year });
      }

      if (seunCompletes) {
        emit('FORMED', 'SEUN', { triggerBranch: seun.branch, effectiveYear: year });
      } else if (baseCount === 3) {
        // Only one clash observation per group/year, independent of how many
        // members are attacked. Don't represent clash as disappearance of a set.
        const clashed = group.branches.filter(branch => isClash(seun.branch, branch));
        if (clashed.length) emit('CLASH', 'SEUN', { clashedBranches: clashed, effectiveYear: year });
      } else if (baseCount < 2 && currentCount === 2 && group.branches.includes(seun.branch)) {
        if (currentHalf) {
          emit('BANHAP', 'SEUN', { triggerBranch: seun.branch, pair: [...currentHalf],
            wangji: group.branches[1], effectiveYear: year });
        } else {
          emit('PARTIAL', 'SEUN', { triggerBranch: seun.branch, effectiveYear: year });
        }
      }
    }
  }
  return signals;
}
