// Generates the WAV files in assets/sounds. Run with: node scripts/generate-sounds.mjs
// Mono 16-bit PCM, phase-continuous so pitch changes never click.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 22050;
const AMPLITUDE = 0.9;

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds');

// A note is { freq, start, length, vibrato?, glide? } in seconds; `voice` shapes its timbre.
const sounds = {
  // "Sad trombone": four descending notes, the last one long and wobbling.
  eliminated: {
    length: 2.3,
    voice: brass,
    notes: [
      { freq: 311, start: 0.0, length: 0.38 },
      { freq: 294, start: 0.4, length: 0.38 },
      { freq: 277, start: 0.8, length: 0.38 },
      { freq: 262, start: 1.2, length: 1.05, vibrato: 6, glide: -0.06 },
    ],
  },

  // Bright rising arpeggio C5 E5 G5 and a held C6.
  win: {
    length: 1.9,
    voice: bell,
    notes: [
      { freq: 523, start: 0.0, length: 0.5 },
      { freq: 659, start: 0.14, length: 0.5 },
      { freq: 784, start: 0.28, length: 0.5 },
      { freq: 1047, start: 0.42, length: 1.45 },
      { freq: 784, start: 0.42, length: 1.45 },
    ],
  },
};

// Buzzy brass: soft-clipped sine with a quick attack and a short release.
function brass(phase, t, length) {
  const env = Math.min(1, t / 0.03, (length - t) / 0.08);
  return (Math.tanh(3 * Math.sin(phase)) / Math.tanh(3)) * env * 0.8;
}

// Bell: fundamental plus a couple of overtones with exponential decay.
function bell(phase, t, length) {
  const env = Math.min(1, t / 0.005, (length - t) / 0.05) * Math.exp(-3 * t);
  return (Math.sin(phase) + 0.35 * Math.sin(2 * phase) + 0.15 * Math.sin(3 * phase)) * env * 0.55;
}

function render({ length, voice, notes }) {
  const n = Math.round(SAMPLE_RATE * length);
  const mix = new Float32Array(n);
  for (const note of notes) {
    let phase = 0;
    const first = Math.round(note.start * SAMPLE_RATE);
    const count = Math.round(note.length * SAMPLE_RATE);
    for (let i = 0; i < count && first + i < n; i++) {
      const t = i / SAMPLE_RATE;
      const wobble = note.vibrato ? 1 + 0.025 * Math.sin(2 * Math.PI * note.vibrato * t) : 1;
      const glide = note.glide ? 1 + note.glide * (t / note.length) : 1;
      phase = (phase + (2 * Math.PI * note.freq * wobble * glide) / SAMPLE_RATE) % (2 * Math.PI);
      mix[first + i] += voice(phase, t, note.length);
    }
  }
  const peak = mix.reduce((max, s) => Math.max(max, Math.abs(s)), 0) || 1;
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    pcm.writeInt16LE(Math.round((mix[i] / peak) * AMPLITUDE * 32767), i * 2);
  }
  return pcm;
}

function wav(pcm) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

mkdirSync(outDir, { recursive: true });
for (const [name, sound] of Object.entries(sounds)) {
  const file = join(outDir, `${name}.wav`);
  writeFileSync(file, wav(render(sound)));
  console.log(`wrote ${file}`);
}
