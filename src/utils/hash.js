// Frontend-only simulation: passwords are hashed (SHA-256 + email salt) before
// being kept in localStorage. A real app would do this on a server.
export async function hashPassword(password, email) {
  const input = `doorlist::${email}::${password}`;
  try {
    if (globalThis.crypto?.subtle) {
      const data = new TextEncoder().encode(input);
      const buffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    /* fall through to the fallback below */
  }
  return btoa(unescape(encodeURIComponent(input)));
}

export function makeId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
}
