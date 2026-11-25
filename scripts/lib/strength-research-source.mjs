// Research-only source patch targets, not public compatibility entry points.
// Update this mapping when implementation modules move; never patch a shim.
export const STRENGTH_SOURCE = Object.freeze({
  "multiaxis": "src/features/strength/multiaxis.js",
  "network": "src/features/strength/network-decision.js",
  "quantitative": "src/features/strength/quantitative.js",
  "integrated": "src/features/strength/integrated-decision.js"
});
