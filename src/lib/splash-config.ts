/**
 * Minimum time (ms) the animated splash screen stays on screen, regardless
 * of how quickly startup content actually finishes loading. The progress
 * bar fills at a steady pace across this duration, so shared between the
 * splash screen's own fill animation and the root layout's readiness gate.
 */
export const SPLASH_MIN_DURATION_MS = 60000;

/**
 * The bar's timed fill stops just short of 100% so a slow device that
 * hasn't actually finished loading by the time the clock runs out doesn't
 * show a stalled "100%" — the last few percent are reserved for the real
 * completion snap once content is actually ready.
 */
export const SPLASH_TIMED_FILL_TARGET = 96;