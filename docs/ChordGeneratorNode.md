# Chord Generator Node

**Category:** `Sources`
**Class:** `ChordGeneratorNode`

Polyphonic chord voice generator producing musical chords across multiple selectable types, glides, and oscillator waveforms.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Root CV** | `voltage` | 1V/Oct CV input modulating root pitch. |
| **MIDI In** | `midi` | MIDI note input stream. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Polyphonic harmonic audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Root Note** | `select` | `C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B` | `C4` | Base root note pitch. |
| **Chord Type** | `select` | `Major Triad`, `Minor Triad`, `Dominant 7th`, `Major 7th`, `Minor 7th`, `Sus2`, `Sus4`, `Diminished`, `Augmented` | `Major Triad` | Harmonic chord interval structure. |
| **Glide (s)** | `slider` | `0` to `1` (step: `0.01`) | `0.01` | Portamento glide duration between pitch changes. |
| **Fine Tune (cents)** | `slider` | `-100` to `100` (step: `1`) | `0` | Global pitch offset in cents. |
| **Waveform** | `select` | `sine`, `square`, `sawtooth`, `triangle` | `sawtooth` | Oscillator voice waveform. |

## Code Details & Nuances

* Uses phase-continuous AudioParam frequency updates with glide portamento to prevent audio clicks.
* Voices crossfade smoothly when changing chord types.

