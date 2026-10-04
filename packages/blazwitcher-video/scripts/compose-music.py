"""Compose Find Your Flow: original music, synthesized without external samples.

Uses NumPy/SciPy from the Manim environment and FFmpeg for loudness mastering.
The final tonic starts at 25 s, matching the brand outro. Output is 28 s stereo.
"""

from pathlib import Path
import subprocess
import tempfile

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt


RATE = 48000
DURATION = 28
BEAT = 60 / 96
RNG = np.random.default_rng(20261004)
MIX = np.zeros((RATE * DURATION, 2), dtype=np.float64)


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def place(signal, start, gain, pan=0):
    offset = round(start * RATE)
    size = min(len(signal), len(MIX) - offset)
    angle = (pan + 1) * np.pi / 4
    MIX[offset:offset + size, 0] += signal[:size] * gain * np.cos(angle)
    MIX[offset:offset + size, 1] += signal[:size] * gain * np.sin(angle)


def keys(midi, duration=2.6, bright=False):
    t = np.arange(round(duration * RATE)) / RATE
    f = hz(midi)
    # Soft electric piano: decaying tine partials and a subtle stereo chorus.
    fundamental = np.sin(2 * np.pi * f * t + 0.003 * np.sin(2 * np.pi * 2.2 * t))
    signal = fundamental * np.exp(-t / 1.25)
    for multiple, level, decay in [(2, 0.28, 0.6), (3, 0.1, 0.28), (7, 0.012, 0.08)]:
        signal += level * np.sin(2 * np.pi * f * multiple * t) * np.exp(-t / decay)
    if bright:
        signal += 0.12 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t / 0.2)
    signal *= (1 - np.exp(-t / 0.008)) * np.minimum(1, (duration - t) / 0.08)
    return signal


def pad(midi, duration):
    t = np.arange(round(duration * RATE)) / RATE
    f = hz(midi)
    signal = sum(np.sin(2 * np.pi * f * detune * t + phase)
                 for detune, phase in [(0.998, 0), (1.002, 0.5)]) / 2
    signal += 0.08 * np.sin(2 * np.pi * f * 2 * t)
    envelope = np.clip(t / 0.65, 0, 1) * np.clip((duration - t) / 0.9, 0, 1)
    return signal * envelope


def bass(midi):
    t = np.arange(round(1.6 * RATE)) / RATE
    signal = np.sin(2 * np.pi * hz(midi) * t)
    signal += 0.12 * np.sin(2 * np.pi * hz(midi) * 2 * t)
    return signal * (1 - np.exp(-t / 0.014)) * np.exp(-t / 0.62)


def kick():
    t = np.arange(round(0.18 * RATE)) / RATE
    phase = 2 * np.pi * (48 * t + 32 * 0.025 * (1 - np.exp(-t / 0.025)))
    return np.sin(phase) * (1 - np.exp(-t / 0.002)) * np.exp(-t / 0.042)


def shaker():
    t = np.arange(round(0.08 * RATE)) / RATE
    noise = RNG.normal(0, 1, len(t))
    filtered = sosfilt(butter(2, [4200, 9500], btype='bandpass', fs=RATE, output='sos'), noise)
    return filtered * (1 - np.exp(-t / 0.003)) * np.exp(-t / 0.02)


# Dmaj9 → Aadd9 → Bm9 → Gmaj9, then Em7 → Asus9 → Dmaj9.
chords = [
    (38, [54, 57, 61, 64]), (33, [52, 57, 59, 61]),
    (35, [54, 57, 61, 62]), (31, [54, 57, 59, 62]),
    (38, [54, 57, 61, 64]), (33, [52, 57, 59, 61]),
    (35, [54, 57, 61, 62]), (31, [54, 57, 59, 62]),
    (40, [55, 59, 62, 66]), (33, [55, 59, 62, 64]),
    (38, [54, 57, 61, 64]),
]
# Sparse, repeating two-bar melody; spaces leave room for the product demo.
motifs = [
    [(0.5, 78), (1.5, 76), (2.75, 73)],
    [(0.75, 76), (2.5, 73)],
    [(0.5, 74), (1.75, 73), (3, 69)],
    [(0.75, 71), (2.25, 74), (3.25, 73)],
]
for bar, (root, notes) in enumerate(chords):
    start = bar * 4 * BEAT
    for index, midi in enumerate(notes):
        place(pad(midi, 3.1), start, 0.014, (index - 1.5) / 2)
        place(keys(midi), start + index * 0.028, 0.04, (index - 1.5) / 3)
    place(bass(root), start, 0.095)
    if bar == 10:
        place(keys(78, duration=2.9), start + 0.05, 0.06, 0.2)
        continue
    if bar > 0:
        place(bass(root), start + 2 * BEAT, 0.065)
        for beat in [0, 2]:
            place(kick(), start + beat * BEAT, 0.065)
        for eighth in range(8):
            place(shaker(), start + eighth * BEAT / 2, 0.012 if eighth % 2 else 0.006, 0.35)
    if bar not in [0, 8, 9]:
        for beat, midi in motifs[(bar - 1) % len(motifs)]:
            place(keys(midi, duration=1.8, bright=True), start + beat * BEAT, 0.04, -0.2)
    # Gently picked chord tones add motion, with a little swing.
    if 1 <= bar <= 9:
        for beat, note_index in [(0.75, 0), (1.5, 2), (2.75, 1), (3.5, 3)]:
            place(keys(notes[note_index] + 12, duration=1.6, bright=True),
                  start + beat * BEAT, 0.027, -0.3 if note_index % 2 else 0.3)

# Short stereo echoes and diffuse room tails, all generated from the dry score.
dry = MIX.copy()
for seconds, level, swap in [(0.1875, 0.13, True), (0.375, 0.07, False), (0.5625, 0.04, True)]:
    delay = round(seconds * RATE)
    source = dry[:, ::-1] if swap else dry
    MIX[delay:] += source[:-delay] * level
room_source = sosfilt(butter(2, 2400, fs=RATE, output='sos'), dry, axis=0)
for seconds in np.linspace(0.065, 0.8, 19):
    delay = round(seconds * RATE)
    MIX[delay:] += room_source[:-delay, ::-1] * 0.015 * np.exp(-seconds / 0.5)

t = np.arange(len(MIX)) / RATE
fade = np.clip(t / 0.3, 0, 1) * np.clip((27.9 - t) / 1.6, 0, 1)
MIX *= fade[:, None]
MIX -= MIX.mean(axis=0)
MIX /= max(1, np.max(np.abs(MIX)) / 0.75)

destination = Path(__file__).resolve().parents[1] / 'public/generated/find-your-flow.wav'
destination.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory() as directory:
    raw = Path(directory) / 'mix.wav'
    wavfile.write(raw, RATE, (MIX * 32767).astype(np.int16))
    subprocess.run([
        'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(raw),
        '-af', 'loudnorm=I=-21:TP=-3:LRA=6', '-ar', str(RATE), '-c:a', 'pcm_s16le',
        str(destination),
    ], check=True)
print(f'Composed {destination.name}: {DURATION}s, stereo, 96 BPM, original synthesis')
