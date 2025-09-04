export function normalizeWhatsAppNumber(raw: string): string {
  const t = raw.trim();
  if (t.startsWith("whatsapp:")) return t;
  if (t.startsWith("+")) return `whatsapp:${t}`;
  return `whatsapp:${t}`;
}

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
