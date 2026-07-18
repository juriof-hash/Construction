// src/utils/randomUtils.ts
import { Geometry } from "../types/geometry";

// Mulberry32 PRNG
// A fast, 32-bit random number generator
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  // Returns a float between 0 (inclusive) and 1 (exclusive)
  public nextFloat(): number {
    this.state |= 0;
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns a float between min and max
  public range(min: number, max: number): number {
    return this.nextFloat() * (max - min) + min;
  }
}

// ----------------------------------------------------
// Safe Generator Wrapper
// Prevents infinite loops by capping retries and falling back to a safe geometry.
// ----------------------------------------------------
export function safeGenerate(
  rng: SeededRandom,
  generatorFn: (rng: SeededRandom, attempt: number) => Geometry[] | null,
  fallbackFn: () => Geometry[],
  maxRetries: number = 200
): Geometry[] {
  for (let i = 0; i < maxRetries; i++) {
    // We pass 'i' (attempt number) so generator can optionally relax constraints as i increases
    const result = generatorFn(rng, i);
    if (result !== null) {
      return result;
    }
  }

  // Fallback to safely defined static problem if everything fails
  console.warn(`[SafeGenerate] Maximum retries (${maxRetries}) exceeded. Falling back to static geometry.`);
  return fallbackFn();
}

/**
 * Gets a deterministic daily seed based on UTC date.
 * This guarantees the same geometry for all users on a given day for Leaderboard fairness.
 */
export function getDailySeed(): number {
  const urlParams = new URLSearchParams(window.location.search);
  const urlSeed = urlParams.get("seed");
  if (urlSeed && !isNaN(Number(urlSeed))) {
    return Number(urlSeed);
  }

  // Get current UTC Date (YYYY-MM-DD)
  const now = new Date();
  const dateString = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
  
  // Simple hash for the string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  return hash;
}
