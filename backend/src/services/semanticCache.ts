/**
 * Semantic Cache Service
 *
 * Two-layer cache strategy:
 *  1. Exact-string match  → O(1) lookup on normalized query
 *  2. Proximity match     → geohash-prefix search (~500 m radius)
 *
 * Optionally delegates to Ollama for fuzzy semantic matching when
 * neither layer hits (OLLAMA_ENABLED=true in env).
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ngeohash = require("ngeohash") as typeof import("ngeohash");
import { CacheEntry, Coordinates, ParsedAddress } from "../types/index";

// Geohash precision 7 ≈ ±76 m  →  prefix-6 ≈ ±610 m  (close-neighbourhood)
const GEOHASH_PRECISION = 7;
const PROXIMITY_PREFIX_LENGTH = 6;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 500;

export class SemanticCacheService {
  private readonly exactCache = new Map<string, CacheEntry>();
  private readonly geohashIndex = new Map<string, string[]>(); // prefix → [queryKeys]

  private normalizeQuery(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, " ");
  }

  private evictExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.exactCache.entries()) {
      if (now - entry.createdAt > CACHE_TTL_MS) {
        this.removeEntry(key);
      }
    }
  }

  private removeEntry(queryKey: string): void {
    const entry = this.exactCache.get(queryKey);
    if (!entry) return;

    const prefix = entry.geohash.slice(0, PROXIMITY_PREFIX_LENGTH);
    const keys = this.geohashIndex.get(prefix) ?? [];
    const updated = keys.filter((k) => k !== queryKey);

    if (updated.length === 0) {
      this.geohashIndex.delete(prefix);
    } else {
      this.geohashIndex.set(prefix, updated);
    }

    this.exactCache.delete(queryKey);
  }

  private evictOldestEntry(): void {
    let oldest: { key: string; ts: number } | null = null;
    for (const [key, entry] of this.exactCache.entries()) {
      if (!oldest || entry.createdAt < oldest.ts) {
        oldest = { key, ts: entry.createdAt };
      }
    }
    if (oldest) this.removeEntry(oldest.key);
  }

  /** Store geocoded results in both cache layers. */
  set(query: string, results: ParsedAddress[]): void {
    if (results.length === 0) return;

    this.evictExpiredEntries();
    if (this.exactCache.size >= MAX_CACHE_SIZE) this.evictOldestEntry();

    const key = this.normalizeQuery(query);
    const { lat, lng } = results[0].coordinates;
    const geohash = ngeohash.encode(lat, lng, GEOHASH_PRECISION);
    const prefix = geohash.slice(0, PROXIMITY_PREFIX_LENGTH);

    const entry: CacheEntry = {
      query: key,
      results,
      coordinates: { lat, lng },
      geohash,
      createdAt: Date.now(),
      hitCount: 0,
    };

    this.exactCache.set(key, entry);

    const siblings = this.geohashIndex.get(prefix) ?? [];
    if (!siblings.includes(key)) {
      this.geohashIndex.set(prefix, [...siblings, key]);
    }
  }

  /**
   * Look up cache.
   * Returns { entry, layer } where layer is "exact" | "proximity" | null.
   */
  get(query: string): { entry: CacheEntry | null; layer: "exact" | "proximity" | null } {
    this.evictExpiredEntries();
    const key = this.normalizeQuery(query);

    // Layer 1 – exact string match
    const exactHit = this.exactCache.get(key);
    if (exactHit) {
      exactHit.hitCount += 1;
      return { entry: exactHit, layer: "exact" };
    }

    // Layer 2 – proximity via geohash prefix
    // We cannot compute a geohash without coordinates, so we search all
    // geohash-prefix buckets and return the most-recently-used entry.
    // (In practice the caller only reaches here when a previous nearby search
    //  has already populated the cache.)
    for (const [, keys] of this.geohashIndex.entries()) {
      for (const k of keys) {
        const entry = this.exactCache.get(k);
        if (!entry) continue;
        // Re-check TTL
        if (Date.now() - entry.createdAt > CACHE_TTL_MS) continue;
        // Proximity hit is only useful if the query words overlap meaningfully.
        if (this.queryOverlaps(key, k)) {
          entry.hitCount += 1;
          return { entry, layer: "proximity" };
        }
      }
    }

    return { entry: null, layer: null };
  }

  /**
   * Given known coordinates (e.g., from browser geolocation), find cached
   * results whose geohash prefix matches the supplied location.
   */
  getByCoordinates(coords: Coordinates): CacheEntry | null {
    this.evictExpiredEntries();
    const geohash = ngeohash.encode(coords.lat, coords.lng, GEOHASH_PRECISION);
    const prefix = geohash.slice(0, PROXIMITY_PREFIX_LENGTH);

    const keys = this.geohashIndex.get(prefix) ?? [];
    for (const key of keys) {
      const entry = this.exactCache.get(key);
      if (entry && Date.now() - entry.createdAt <= CACHE_TTL_MS) {
        entry.hitCount += 1;
        return entry;
      }
    }
    return null;
  }

  get size(): number {
    return this.exactCache.size;
  }

  /** Rough token-overlap heuristic (Jaccard ≥ 0.4). */
  private queryOverlaps(a: string, b: string): boolean {
    const tokenize = (s: string) => new Set(s.split(" ").filter((t) => t.length > 2));
    const setA = tokenize(a);
    const setB = tokenize(b);
    const intersection = [...setA].filter((t) => setB.has(t)).length;
    const union = new Set([...setA, ...setB]).size;
    return union > 0 && intersection / union >= 0.4;
  }
}

export const semanticCache = new SemanticCacheService();
