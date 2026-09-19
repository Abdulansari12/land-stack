/**
 * Production Rate-Limiter Stub & Distributed Architecture Specification
 *
 * ============================================================================
 * PRODUCTION DISTRIBUTED ARCHITECTURE (Redis / Upstash / Edge Middleware):
 * ============================================================================
 * In production multi-instance, serverless (Next.js on Vercel / AWS Lambda / Cloud Run),
 * or containerized Kubernetes deployments, in-memory rate-limiting stores are scoped to
 * individual isolated worker processes. An attacker or client can circumvent limits
 * simply by rotating requests across different containers or edge locations.
 *
 * PRODUCTION INTEGRATION BLUEPRINT:
 * 1. Distributed Key-Value Store:
 *    Deploy Redis (e.g. AWS ElastiCache, GCP Memorystore, or Upstash Redis for serverless).
 *
 * 2. Sliding Window or Token Bucket via Redis:
 *    ```typescript
 *    import { Ratelimit } from "@upstash/ratelimit";
 *    import { Redis } from "@upstash/redis";
 *
 *    const redis = new Redis({
 *      url: process.env.UPSTASH_REDIS_REST_URL!,
 *      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
 *    });
 *
 *    // Create a new ratelimiter that allows 60 requests per 1 minute
 *    export const productionRatelimit = new Ratelimit({
 *      redis,
 *      limiter: Ratelimit.slidingWindow(60, "1 m"),
 *      analytics: true,
 *      prefix: "landstack:ratelimit",
 *    });
 *    ```
 *
 * 3. Middleware Placement (`middleware.ts`):
 *    In production Next.js, rate-limiting should execute at the Edge before hitting
 *    route handlers, saving backend CPU cycles:
 *    ```typescript
 *    // middleware.ts
 *    export async function middleware(request: NextRequest) {
 *      if (request.nextUrl.pathname.startsWith('/api/')) {
 *        const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
 *        const { success, limit, remaining, reset } = await productionRatelimit.limit(ip);
 *        if (!success) {
 *          return new NextResponse('Too Many Requests', {
 *            status: 429,
 *            headers: {
 *              'X-RateLimit-Limit': limit.toString(),
 *              'X-RateLimit-Remaining': remaining.toString(),
 *              'X-RateLimit-Reset': reset.toString(),
 *              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
 *            },
 *          });
 *        }
 *      }
 *      return NextResponse.next();
 *    }
 *    ```
 *
 * ============================================================================
 * IN-MEMORY SLIDING-WINDOW STUB (Development / Single-Node / Test Harness):
 * ============================================================================
 * The implementation below provides a fully functioning in-memory sliding-window
 * rate limiter for local testing, development, and unit test suites.
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix epoch timestamp (ms)
  retryAfterSeconds: number;
}

interface WindowRecord {
  timestamps: number[];
}

// In-memory token/timestamp store keyed by client identifier (e.g. IP or API key)
const rateLimitMap = new Map<string, WindowRecord>();

// Cleanup stale records every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  // Unref timer in Node environment so it doesn't block process exit
  if (timer && typeof timer.unref === "function") {
    timer.unref();
  }
}

/**
 * Checks whether a client request is within the allowed rate limit using a sliding window.
 *
 * @param identifier Client IP address, API key, or session identifier
 * @param limit Maximum requests permitted in the window (default: 60)
 * @param windowMs Window duration in milliseconds (default: 60,000ms / 1 min)
 * @returns RateLimitResult with allowed status and standard HTTP headers metadata
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitMap.get(identifier);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter timestamps outside current sliding window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  const reset = now + windowMs;

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0] || now;
    const retryAfterMs = Math.max(0, oldest + windowMs - now);
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));

    return {
      allowed: false,
      limit,
      remaining: 0,
      reset: oldest + windowMs,
      retryAfterSeconds,
    };
  }

  // Record this request timestamp
  record.timestamps.push(now);

  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    allowed: true,
    limit,
    remaining,
    reset,
    retryAfterSeconds: 0,
  };
}

/**
 * Helper to construct standard rate-limit HTTP response headers.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
  };

  if (!result.allowed) {
    headers["Retry-After"] = result.retryAfterSeconds.toString();
  }

  return headers;
}

/**
 * Helper to clear rate limit records (useful for automated testing)
 */
export function resetRateLimits(): void {
  rateLimitMap.clear();
}
