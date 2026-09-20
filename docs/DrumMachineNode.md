# Drum Machine Node

**Category:** `Sources`
**Class:** `DrumMachineNode`

Pattern-based drum rhythm synthesizer supporting 808, 909, Chiptune, and Acoustic drum kits with mini-notation pattern triggers.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Clock In** | `voltage` | External rhythm clock pulse. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Stereo drum audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **BPM** | `slider` | `60` to `200` (step: `1`) | `120` | Playback speed in BPM. |
| **Drum Kit** | `select` | `808`, `909`, `Chiptune`, `Acoustic` | `808` | Drum voice soundbank. |

## Code Details & Nuances

* Mini-notation trigger syntax: k (kick), s (snare), h (closed hat), o (open hat), c (clap), t (tom).
