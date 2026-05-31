export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 8000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const isRateLimit =
        err?.message?.includes('too many errors') ||
        err?.message?.includes('-32002') ||
        err?.message?.includes('RPC error -32002');
      if (!isRateLimit || attempt === maxAttempts - 1) throw err;
      const delay = baseDelayMs * Math.pow(2, attempt);
      console.warn(`RPC rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}
