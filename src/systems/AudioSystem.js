/**
 * Retro arcade audio via Tone.js
 * Uses lazy initialization to comply with browser autoplay policy.
 */

let toneLoaded = false
let Tone = null

let thrustSynth = null
let thrustStarted = false
let musicPart = null
let musicStarted = false

async function loadTone() {
  if (toneLoaded) return
  Tone = await import('tone')
  toneLoaded = true
}

export const AudioSystem = {
  async init() {
    try {
      await loadTone()
      await Tone.start()
      _buildSynths()
      _startMusic()
    } catch (e) {
      console.warn('Audio init failed:', e)
    }
  },

  startThrust() {
    if (!thrustSynth || thrustStarted) return
    thrustStarted = true
    thrustSynth.triggerAttack('C2')
  },

  stopThrust() {
    if (!thrustSynth || !thrustStarted) return
    thrustStarted = false
    thrustSynth.triggerRelease()
  },

  playExplosion() {
    if (!Tone) return
    const noise = new Tone.NoiseSynth({
      noise: { type: 'brown' },
      envelope: { attack: 0.01, decay: 0.6, sustain: 0, release: 0.1 }
    }).toDestination()
    noise.volume.value = -8
    noise.triggerAttackRelease('16n')
    setTimeout(() => noise.dispose(), 2000)

    // Low boom
    const boom = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.2 }
    }).toDestination()
    boom.volume.value = -10
    boom.triggerAttackRelease('C1', '8n')
    setTimeout(() => boom.dispose(), 2000)
  },

  playSuccess() {
    if (!Tone) return
    const synth = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.2 }
    }).toDestination()
    synth.volume.value = -12

    const now = Tone.now()
    const jingle = ['C4', 'E4', 'G4', 'C5']
    jingle.forEach((note, i) => {
      synth.triggerAttackRelease(note, '8n', now + i * 0.15)
    })
    setTimeout(() => synth.dispose(), 3000)
  }
}

function _buildSynths() {
  if (thrustSynth) return

  // Thrust: FM synth with modulation
  thrustSynth = new Tone.FMSynth({
    modulationIndex: 8,
    harmonicity: 0.5,
    oscillator: { type: 'sawtooth' },
    modulation: { type: 'square' },
    envelope: { attack: 0.05, decay: 0, sustain: 1, release: 0.2 },
    modulationEnvelope: { attack: 0.1, decay: 0, sustain: 1, release: 0.2 }
  }).toDestination()
  thrustSynth.volume.value = -18
}

function _startMusic() {
  if (musicStarted) return
  musicStarted = true

  // Simple arpeggio pattern
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 }
  }).toDestination()
  synth.volume.value = -26

  const bass = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 }
  }).toDestination()
  bass.volume.value = -22

  // Melody sequence
  const melody = [
    'C4', 'E4', 'G4', 'B4',
    'A4', 'F4', 'D4', 'B3',
    'G3', 'B3', 'D4', 'G4',
    'F4', 'A4', 'C5', 'E5'
  ]
  const bassLine = ['C2', 'C2', 'A1', 'A1', 'G1', 'G1', 'F1', 'F1']

  let mi = 0, bi = 0
  const melPart = new Tone.Part((time, note) => {
    synth.triggerAttackRelease(note, '16n', time)
  }, melody.map((n, i) => [i * 0.2, n]))

  melPart.loop = true
  melPart.loopEnd = melody.length * 0.2
  melPart.start(0)

  const bassPart = new Tone.Part((time, note) => {
    bass.triggerAttackRelease(note, '8n', time)
  }, bassLine.map((n, i) => [i * 0.4, n]))

  bassPart.loop = true
  bassPart.loopEnd = bassLine.length * 0.4
  bassPart.start(0)

  Tone.Transport.bpm.value = 120
  Tone.Transport.start()
}
