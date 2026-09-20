# Arpeggiator Node

**Category:** `Modulation & Sequencing`
**Class:** `ArpeggiatorNode`

Arpeggiator generating melodic note sequences from chord inputs or root selections with dual Audio and MIDI outputs.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Clock In** | `voltage` | External clock pulse input. |
| **MIDI In** | `midi` | Incoming MIDI notes. |
| **Transpose CV** | `voltage` | Pitch transposition CV input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio** | `voltage` | Internal synth audio output. |
| **MIDI Out** | `midi` | Arpeggiated MIDI note stream. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **BPM** | `slider` | `60` to `240` (step: `1`) | `120` | Tempo when no external clock is connected. |
| **Note Duration** | `select` | `1`, `1/2`, `1/4`, `1/8`, `1/16`, `1/32`, `1/64`, `1/128` | `1/16` | Note subdivision duration. |
| **Chord Type** | `select` | `Major Triad`, `Minor Triad`, `Dominant 7th`, `Major 7th`, `Minor 7th`, `Sus2`, `Sus4`, `Diminished`, `Augmented` | `Major Triad` | Harmonic chord structure. |
| **Root Note** | `select` | `C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B` | `C4` | Base note pitch. |
| **Pattern** | `select` | `Up`, `Down`, `Up-Down`, `Down-Up`, `Random` | `Up` | Arpeggio playback direction. |
| **Octaves** | `slider` | `1` to `4` (step: `1`) | `1` | Octave range span. |

## Code Details & Nuances

* External Clock In overrides internal BPM slider.
* Outputs both live audio from built-in synth and MIDI triggers for external nodes.

