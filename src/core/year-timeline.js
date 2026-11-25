import { getYearSignals } from './year-signals.js';
import { explainYearSignals } from './year-explanation.js';
import { summarizeMovementSignals, MOVEMENT_INDEX_VERSION } from './movement-presentation.js';

import { evaluateYearTimeline } from './year-timeline-kernel.js';

export function getYearTimeline(input = {}) {
  return evaluateYearTimeline(input,{getYearSignals,explainYearSignals,summarizeMovementSignals,MOVEMENT_INDEX_VERSION});
}
