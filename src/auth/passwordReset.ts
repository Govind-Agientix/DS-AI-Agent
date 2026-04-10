const PREFIX = "ds-ai-reset-token:";

type StoredReset = {
  email: string;
  exp: number;
};

export function createPasswordResetToken(email: string): string {
  const token = crypto.randomUUID();
  const payload: StoredReset = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + 60 * 60 * 1000,
  };
  sessionStorage.setItem(PREFIX + token, JSON.stringify(payload));
  return token;
}

export function readPasswordResetToken(token: string | null): StoredReset | null {
  if (!token) return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + token);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredReset;
    if (!parsed?.email || typeof parsed.exp !== "number") return null;
    if (Date.now() > parsed.exp) {
      sessionStorage.removeItem(PREFIX + token);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPasswordResetToken(token: string): void {
  sessionStorage.removeItem(PREFIX + token);
}
