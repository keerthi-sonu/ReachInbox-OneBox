export function categorizeEmail(body: string): string {
  const text = body.toLowerCase();
  if (text.includes('meeting')) return 'Meeting Booked';
  if (text.includes('interested')) return 'Interested';
  if (text.includes('unsubscribe')) return 'Spam';
  return 'General';
}
