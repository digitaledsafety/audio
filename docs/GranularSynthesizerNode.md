# Granular Synthesizer Node

**Category:** `Sources`
**Class:** `GranularSynthesizerNode`

Real-time granular synthesis engine splitting incoming or recorded audio into microscopic grains with time/pitch jitter.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Live audio stream input. |
| **Grain Size CV** | `voltage` | Grain size CV modulation. |
| **Grain Density CV** | `voltage` | Grain density CV modulation. |
| **Pitch Shift CV** | `voltage` | Pitch transpose CV modulation. |
| **Jitter CV** | `voltage` | Position jitter CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Granular synthesized audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Grain Size (s)** | `slider` | `0.01` to `0.5` (step: `0.001`) | `0.1` | Grain playback window duration. |
| **Grain Density (Hz)** | `slider` | `1` to `100` (step: `1`) | `20` | Grains per second density. |
| **Pitch Shift (st)** | `slider` | `-12` to `12` (step: `1`) | `0` | Pitch transposition in semitones. |
| **Jitter (s)** | `slider` | `0` to `0.2` (step: `0.001`) | `0.02` | Buffer offset randomization. |

## Code Details & Nuances

* Powered by GranularProcessor AudioWorklet.
* Overlapping grains use Gaussian window envelopes.

