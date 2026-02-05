
const RATE_LIMIT_KEY = 'txsense_rate_limit_timestamps';
const MAX_REQUESTS_PER_WINDOW = 10;
const WINDOW_SIZE_MS = 60000; // 1 minute

export const checkRateLimit = (): { allowed: boolean; waitTimeSeconds: number } => {
  const now = Date.now();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  let timestamps: number[] = stored ? JSON.parse(stored) : [];

  // Filter out timestamps outside the current window
  timestamps = timestamps.filter(ts => now - ts < WINDOW_SIZE_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = timestamps[0];
    const waitTime = Math.ceil((WINDOW_SIZE_MS - (now - oldestTimestamp)) / 1000);
    return { allowed: false, waitTimeSeconds: waitTime };
  }

  return { allowed: true, waitTimeSeconds: 0 };
};

export const recordRequest = () => {
  const now = Date.now();
  const stored = localStorage.getItem(RATE_LIMIT_KEY);
  let timestamps: number[] = stored ? JSON.parse(stored) : [];
  
  // Clean up old ones first
  timestamps = timestamps.filter(ts => now - ts < WINDOW_SIZE_MS);
  timestamps.push(now);
  
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(timestamps));
};
