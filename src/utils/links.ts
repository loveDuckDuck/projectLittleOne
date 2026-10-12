export function safeLink(value: string, kind: 'web' | 'email' | 'phone' = 'web'): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (kind === 'email') return `mailto:${encodeURIComponent(trimmed).replace(/%40/g, '@')}`;
  if (kind === 'phone') return `tel:${trimmed.replace(/[^+\d]/g, '')}`;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}
