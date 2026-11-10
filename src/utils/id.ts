export function generateId(prefix = 'el'): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}_${randomPart}`;
}

