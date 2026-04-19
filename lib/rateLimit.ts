export function rateLimit(options: {
  interval: number
  limit: number
}) {
  const tokenCache = new Map()

  return {
    check: (ip: string) => {
      const now = Date.now()
      const windowStart = now - options.interval

      const requestTimestamps = tokenCache.get(ip) || []
      const recentRequests = requestTimestamps.filter(
        (timestamp: number) => timestamp > windowStart
      )

      recentRequests.push(now)
      tokenCache.set(ip, recentRequests)

      if (recentRequests.length > options.limit) {
        throw new Error('Rate limit exceeded')
      }
    },
  }
}
