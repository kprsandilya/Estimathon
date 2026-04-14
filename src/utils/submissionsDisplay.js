/** How many wrong attempts to show (latest state; legacy subs default to 1). */
export function wrongMarkCount(sub) {
  if (!sub || sub.correct) return 0
  const n = sub.wrongAttempts
  if (typeof n === 'number' && n > 0) return n
  return 1
}
