/**
 * Level definitions for all 10 levels.
 * Each level increases difficulty:
 *   - more gravity
 *   - less fuel
 *   - rougher terrain
 *   - smaller/fewer pads
 *   - faster starting velocity (future)
 */

export const LEVELS = [
  // Level 1 — Tutorial: gentle gravity, wide pad, lots of fuel
  {
    gravity: 60,
    startFuel: 500,
    thrustMultiplier: 1.0,
    roughness: 40,
    terrainSegments: 12,
    pads: 1,
    groundHeight: 100,
    spawnPoint: { x: 400, y: 80 }
  },
  // Level 2
  {
    gravity: 70,
    startFuel: 470,
    thrustMultiplier: 1.0,
    roughness: 55,
    terrainSegments: 14,
    pads: 1,
    groundHeight: 90,
    spawnPoint: { x: 180, y: 80 }
  },
  // Level 3
  {
    gravity: 80,
    startFuel: 440,
    thrustMultiplier: 1.0,
    roughness: 65,
    terrainSegments: 14,
    pads: 1,
    groundHeight: 85,
    spawnPoint: { x: 620, y: 80 }
  },
  // Level 4
  {
    gravity: 90,
    startFuel: 420,
    thrustMultiplier: 1.0,
    roughness: 70,
    terrainSegments: 16,
    pads: 1,
    groundHeight: 80,
    spawnPoint: { x: 400, y: 70 }
  },
  // Level 5 — Two pads (either counts)
  {
    gravity: 95,
    startFuel: 400,
    thrustMultiplier: 0.95,
    roughness: 75,
    terrainSegments: 16,
    pads: 2,
    groundHeight: 80,
    spawnPoint: { x: 400, y: 70 }
  },
  // Level 6
  {
    gravity: 100,
    startFuel: 380,
    thrustMultiplier: 0.95,
    roughness: 80,
    terrainSegments: 18,
    pads: 1,
    groundHeight: 75,
    spawnPoint: { x: 200, y: 60 }
  },
  // Level 7
  {
    gravity: 110,
    startFuel: 360,
    thrustMultiplier: 0.9,
    roughness: 85,
    terrainSegments: 18,
    pads: 1,
    groundHeight: 70,
    spawnPoint: { x: 600, y: 60 }
  },
  // Level 8
  {
    gravity: 120,
    startFuel: 340,
    thrustMultiplier: 0.9,
    roughness: 90,
    terrainSegments: 20,
    pads: 1,
    groundHeight: 65,
    spawnPoint: { x: 400, y: 55 }
  },
  // Level 9
  {
    gravity: 130,
    startFuel: 300,
    thrustMultiplier: 0.85,
    roughness: 95,
    terrainSegments: 20,
    pads: 1,
    groundHeight: 60,
    spawnPoint: { x: 150, y: 55 }
  },
  // Level 10 — Maximum challenge
  {
    gravity: 145,
    startFuel: 260,
    thrustMultiplier: 0.85,
    roughness: 100,
    terrainSegments: 22,
    pads: 1,
    groundHeight: 55,
    spawnPoint: { x: 650, y: 50 }
  }
]
