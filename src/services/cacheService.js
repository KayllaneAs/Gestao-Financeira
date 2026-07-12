/**
 * Cache Service - In-memory caching for improved performance
 * Uses a simple Map-based cache with TTL support
 */

class CacheService {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 10 * 60 * 1000 // 10 minutes default
  }

  /**
   * Generate a cache key from user ID and params
   */
  generateKey(prefix, userId, params = {}) {
    const paramStr = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|')
    return `${prefix}:${userId}:${paramStr}`
  }

  /**
   * Get item from cache
   */
  get(key) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  /**
   * Set item in cache with TTL
   */
  set(key, value, ttlMs = this.defaultTTL) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs
    })
    return value
  }

  /**
   * Delete specific key
   */
  delete(key) {
    return this.cache.delete(key)
  }

  /**
   * Invalidate all cache entries for a user (prefix-based)
   */
  invalidateUser(userId) {
    for (const key of this.cache.keys()) {
      if (key.includes(`:${userId}:`)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Invalidate cache by prefix (e.g., 'dashboard', 'despesas')
   */
  invalidatePrefix(prefix, userId = null) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        if (userId === null || key.includes(`:${userId}:`)) {
          this.cache.delete(key)
        }
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
  }

  /**
   * Get or set - returns cached value or executes fn and caches result
   */
  async getOrSet(key, fn, ttlMs = this.defaultTTL) {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }
    
    const value = await fn()
    return this.set(key, value, ttlMs)
  }

  /**
   * Get cache stats
   */
  stats() {
    let validCount = 0
    let expiredCount = 0
    const now = Date.now()
    
    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredCount++
      } else {
        validCount++
      }
    }
    
    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount
    }
  }

  /**
   * Cleanup expired entries (call periodically)
   */
  cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// TTL presets
export const TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 10 * 60 * 1000,    // 10 minutes  
  LONG: 30 * 60 * 1000,      // 30 minutes
  HOUR: 60 * 60 * 1000,      // 1 hour
}

// Cache key prefixes
export const CACHE_KEYS = {
  DASHBOARD_RESUMO: 'dashboard:resumo',
  DASHBOARD_RELATORIO: 'dashboard:relatorio',
  DESPESAS_LISTA: 'despesas:lista',
  DESPESAS_CATEGORIA: 'despesas:categoria',
  DESPESAS_TOP: 'despesas:top',
  RENDAS_LISTA: 'rendas:lista',
  CONTAS_LISTA: 'contas:lista',
}

// Singleton instance
const cacheService = new CacheService()

// Auto cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => cacheService.cleanup(), 5 * 60 * 1000)
}

export default cacheService
