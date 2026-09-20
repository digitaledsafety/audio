# Noise Source Node

**Category:** `Sources`
**Class:** `NoiseGeneratorNode`

Multi-spectrum noise generator producing White, Pink, or Brownian noise signals for percussive synthesis or atmospheric texture.

## Inputs

*This node has no inputs.*

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Continuous noise signal output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Noise Type** | `select` | `white`, `pink`, `brownian` | `white` | Selects noise spectral density distribution. |
| **Volume** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Noise output volume level. |

## Code Details & Nuances

* Pink noise filters white noise with -3dB/octave slope.
* Brownian noise uses -6dB/octave lowpass filtering.
