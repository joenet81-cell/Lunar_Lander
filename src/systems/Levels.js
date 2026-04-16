/**
 * Level definitions — 10 levels with progressive difficulty.
 *
 * New features unlock gradually:
 *   Lvl 1-2 : open space, gentle physics, wide pads
 *   Lvl 3-4 : ceiling stalactites + wind starts
 *   Lvl 5-6 : asteroids appear, narrower pads, less fuel
 *   Lvl 7-8 : denser rocks + faster asteroids + strong wind
 *   Lvl 9-10: max chaos — tight pads, heavy gravity, lots of hazards
 *
 * Fields:
 *   gravity          px/s² applied each frame
 *   startFuel        initial fuel amount (max 500)
 *   thrustMultiplier scales thrust force
 *   roughness        terrain height variance in px
 *   terrainSegments  number of terrain points
 *   groundHeight     px from bottom where flat ground sits
 *   padWidth         landing/launch pad width in px (null = auto ~8% of screen)
 *   ceilingRocks     number of stalactites hanging from top
 *   asteroids        number of moving asteroid obstacles
 *   wind             constant horizontal force in px/s² (positive = rightward)
 *   label            displayed at level start
 */
export const LEVELS = [
  // ── Level 1 — Tutorial (→ right) ─────────────────────────
  {
    mapDirection: 'right',
    gravity: 55, startFuel: 500, thrustMultiplier: 1.0,
    roughness: 28, terrainSegments: 10, groundHeight: 110, padWidth: 130,
    ceilingRocks: 0, asteroids: 0, wind: 0,
    label: 'TUTORIAL'
  },

  // ── Level 2 — Up: first vertical map ─────────────────────
  {
    mapDirection: 'up',
    gravity: 68, startFuel: 460, thrustMultiplier: 1.0,
    roughness: 40, terrainSegments: 12, groundHeight: 90, padWidth: 110,
    ceilingRocks: 0, asteroids: 0, wind: 0,
    label: 'ASCENT'
  },

  // ── Level 3 — Cave (→ right) ──────────────────────────────
  {
    mapDirection: 'right',
    gravity: 78, startFuel: 430, thrustMultiplier: 1.0,
    roughness: 62, terrainSegments: 13, groundHeight: 90, padWidth: 100,
    ceilingRocks: 4, asteroids: 0, wind: 0,
    label: 'CAVE'
  },

  // ── Level 4 — High Climb (↑ up) ───────────────────────────
  {
    mapDirection: 'up',
    gravity: 88, startFuel: 400, thrustMultiplier: 1.0,
    roughness: 65, terrainSegments: 14, groundHeight: 85, padWidth: 95,
    ceilingRocks: 5, asteroids: 0, wind: 18,
    label: 'HIGH CLIMB'
  },

  // ── Level 5 — Asteroid Field (→ right) ───────────────────
  {
    mapDirection: 'right',
    gravity: 95, startFuel: 375, thrustMultiplier: 0.95,
    roughness: 76, terrainSegments: 15, groundHeight: 82, padWidth: 88,
    ceilingRocks: 5, asteroids: 2, wind: 0,
    label: 'ASTEROID FIELD'
  },

  // ── Level 6 — Storm Tower (↑ up) ─────────────────────────
  {
    mapDirection: 'up',
    gravity: 105, startFuel: 345, thrustMultiplier: 0.95,
    roughness: 82, terrainSegments: 16, groundHeight: 78, padWidth: 80,
    ceilingRocks: 8, asteroids: 3, wind: 22,
    label: 'STORM TOWER'
  },

  // ── Level 7 — Deep Space (→ right) ───────────────────────
  {
    mapDirection: 'right',
    gravity: 115, startFuel: 315, thrustMultiplier: 0.9,
    roughness: 88, terrainSegments: 17, groundHeight: 74, padWidth: 74,
    ceilingRocks: 11, asteroids: 4, wind: 28,
    label: 'DEEP SPACE'
  },

  // ── Level 8 — Vertical Chaos (↑ up) ──────────────────────
  {
    mapDirection: 'up',
    gravity: 126, startFuel: 285, thrustMultiplier: 0.88,
    roughness: 93, terrainSegments: 18, groundHeight: 70, padWidth: 68,
    ceilingRocks: 14, asteroids: 5, wind: 34,
    label: 'VERTICAL CHAOS'
  },

  // ── Level 9 — Nightmare (→ right) ────────────────────────
  {
    mapDirection: 'right',
    gravity: 138, startFuel: 250, thrustMultiplier: 0.85,
    roughness: 97, terrainSegments: 20, groundHeight: 65, padWidth: 62,
    ceilingRocks: 17, asteroids: 7, wind: 38,
    label: 'NIGHTMARE'
  },

  // ── Level 10 — Hell Tower (↑ up) ─────────────────────────
  {
    mapDirection: 'up',
    gravity: 152, startFuel: 210, thrustMultiplier: 0.82,
    roughness: 102, terrainSegments: 22, groundHeight: 60, padWidth: 56,
    ceilingRocks: 20, asteroids: 9, wind: 44,
    label: 'HELL TOWER'
  }
]
