import fs from 'fs'

interface QueueItem<T> {
  key: string
  requestFunc: () => Promise<T>
  resolve: (value: T) => void
  reject: (err: unknown) => void
}

export class RateLimiter {
  private queue: Array<QueueItem<unknown>> = []
  private inflight = new Map<string, Promise<unknown>>()
  private isProcessing = false
  private lastRequestTime = 0
  private requestCount = 0
  private windowStart = Date.now()
  private staleLockMs = 5 * 60 * 1000

  constructor(
    private maxRequestsPerMinute = 200,
    private lockFilePath?: string
  ) { }

  private async acquireLock() {
    if (!this.lockFilePath) return

    if (fs.existsSync(this.lockFilePath)) {
      const stats = fs.statSync(this.lockFilePath)
      const age = Date.now() - stats.ctimeMs
      if (age > this.staleLockMs) {
        try {
          fs.unlinkSync(this.lockFilePath)
          console.warn('[RateLimiter] Removed stale lock file', this.lockFilePath)
        } catch (err) {
          console.error('[RateLimiter] Failed to remove stale lock file', err)
        }
      }
    }

    while (true) {
      try {
        fs.writeFileSync(this.lockFilePath, process.pid.toString(), { flag: 'wx' })
        return
      } catch (err) {
        const code = err instanceof Error && 'code' in err
          ? (err as NodeJS.ErrnoException).code
          : undefined

        if (code === 'EEXIST') await new Promise(res => setTimeout(res, 100))
        else throw err
      }
    }
  }

  private releaseLock() {
    if (!this.lockFilePath) return

    try {
      if (
        fs.existsSync(this.lockFilePath) &&
        fs.readFileSync(this.lockFilePath, 'utf8') === process.pid.toString()
      ) {
        fs.unlinkSync(this.lockFilePath)
      }
    } catch (err) {
      console.error('[RateLimiter] Failed to release lock file', err)
    }
  }

  public enqueue<T>(key: string, requestFunc: () => Promise<T>): Promise<T> {
    const existing = this.inflight.get(key)
    if (existing) return existing as Promise<T>

    const promise = new Promise<T>((resolve, reject) => {
      this.queue.push({
        key,
        requestFunc,
        resolve: resolve as (value: unknown) => void,
        reject
      })
      if (!this.isProcessing) void this.processQueue()
    })

    this.inflight.set(key, promise)
    return promise
  }

  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true

    try {
      await this.acquireLock()
      const now = Date.now()
      const elapsed = now - this.windowStart

      if (elapsed > 60_000) {
        this.requestCount = 0
        this.windowStart = now
      }

      if (this.requestCount >= this.maxRequestsPerMinute) {
        const waitTime = 60_000 - elapsed + 100
        await new Promise(res => setTimeout(res, waitTime))
        this.requestCount = 0
        this.windowStart = Date.now()
      }

      const minInterval = 1000
      const waitTime = Math.max(0, minInterval - (now - this.lastRequestTime))
      if (waitTime > 0) await new Promise(res => setTimeout(res, waitTime))

      const { key, requestFunc, resolve, reject } = this.queue.shift()!

      try {
        const result = await requestFunc()
        this.lastRequestTime = Date.now()
        this.requestCount++
        resolve(result)
      } catch (err) {
        reject(err)
      } finally {
        this.inflight.delete(key)
      }
    } catch (err) {
      console.error('[RateLimiter] Queue error', err)
    } finally {
      this.releaseLock()
      setTimeout(() => {
        void this.processQueue()
      }, 0)
    }
  }
}
