# Vocoder Node

**Category:** `Effects`
**Class:** `VocoderNode`

Multi-band vocoder applying vocal modulator spectral envelope filters onto carrier synthesis tones.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Carrier In** | `voltage` | Carrier synthesizer input. |
| **Modulator In** | `voltage` | Modulator vocal input. |
| **Bands CV** | `voltage` | Filter band count CV modulation. |
| **Formant CV** | `voltage` | Formant shift CV modulation. |
| **Unvoiced CV** | `voltage` | Unvoiced sibilance CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Vocoded audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Carrier Freq** | `slider` | `50` to `1000` (step: `1`) | `110` | Internal carrier base frequency. |
| **Carrier Wave** | `select` | `sine`, `square`, `sawtooth`, `triangle` | `sawtooth` | Internal carrier wave shape. |
| **Filter Bands** | `slider` | `4` to `32` (step: `1`) | `16` | Number of spectral filter bands. |
| **Formant Shift** | `slider` | `0.5` to `2` (step: `0.01`) | `1` | Formant shift multiplier. |

## Code Details & Nuances

* Uses VocoderProcessor AudioWorklet for real-time parallel bandpass spectral tracking.

