export const DAILY_INSIGHTS = [
  { id: 'daniel-2-22', reflection: 'God reveals the unseen so we can stand firm in the seen.', book: 'Daniel', chapter: 2, verse: 22 },
  { id: 'daniel-1-8', reflection: 'Conviction in small things prepares us for courage in great trials.', book: 'Daniel', chapter: 1, verse: 8 },
  { id: 'daniel-3-17', reflection: 'True faith trusts God for the outcome without demanding a specific rescue.', book: 'Daniel', chapter: 3, verse: 17 },
  { id: 'daniel-4-37', reflection: 'Humility before God restores clarity to our perspective.', book: 'Daniel', chapter: 4, verse: 37 },
  { id: 'daniel-6-10', reflection: 'Consistent daily prayer forms an unshakeable foundation in times of crisis.', book: 'Daniel', chapter: 6, verse: 10 },
  { id: 'daniel-9-19', reflection: 'God hears the prayers of the humble before the answer even arrives.', book: 'Daniel', chapter: 9, verse: 19 },
  { id: 'daniel-12-3', reflection: 'Those who lead others to wisdom will shine with enduring light.', book: 'Daniel', chapter: 12, verse: 3 },
];

export function getTodayDailyInsight() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const index = Math.abs(dayOfYear) % DAILY_INSIGHTS.length;
  return DAILY_INSIGHTS[index];
}
