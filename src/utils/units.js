/** @typedef {{ id: string, label: string, mult: number }} ScaleUnit */

/** @type {ScaleUnit[]} */
export const SCALE_UNITS = [
  { id: '1', label: 'ones', mult: 1 },
  { id: '1e3', label: 'thousands', mult: 1e3 },
  { id: '1e6', label: 'millions', mult: 1e6 },
  { id: '1e9', label: 'billions', mult: 1e9 },
  { id: '1e12', label: 'trillions', mult: 1e12 },
]

const DEFAULT_UNIT_ID = '1'

/** @param {string | undefined} unitId */
export function multiplier(unitId) {
  const u = SCALE_UNITS.find((x) => x.id === unitId)
  return u ? u.mult : 1
}

/** @param {string | undefined} unitId */
export function unitLabel(unitId) {
  const u = SCALE_UNITS.find((x) => x.id === unitId)
  return u ? u.label : 'ones'
}

/**
 * Canonical numeric value from typed value × scale.
 * @param {number} value
 * @param {string | undefined} unitId
 */
export function toCanonical(value, unitId) {
  if (!Number.isFinite(value)) return NaN
  return value * multiplier(unitId)
}

/**
 * Upper bound: if offset, (bBox - 1) × scale(b), else bBox × scale(b).
 * @param {number} bBox raw value from b input
 * @param {string | undefined} bUnit
 * @param {boolean} bOffset
 */
export function effectiveUpperBound(bBox, bUnit, bOffset) {
  const m = multiplier(bUnit)
  if (bOffset) return (bBox - 1) * m
  return bBox * m
}

/**
 * @param {{ answer?: number, answerUnit?: string }} q
 */
export function canonicalQuestionAnswer(q) {
  const v = typeof q.answer === 'number' ? q.answer : 0
  return toCanonical(v, q.answerUnit || DEFAULT_UNIT_ID)
}

/**
 * Human-readable: "5 million" or "12" for ones.
 * @param {{ answer?: number, answerUnit?: string }} q
 */
export function formatQuestionAnswerDisplay(q) {
  const v = typeof q.answer === 'number' ? q.answer : 0
  const uid = q.answerUnit || DEFAULT_UNIT_ID
  if (uid === '1' || uid === DEFAULT_UNIT_ID) return String(v)
  return `${v} ${unitLabel(uid)}`
}
