# LFO Node

**Category:** `Modulation & Sequencing`
**Class:** `LFONode`

Low Frequency Oscillator generating sub-audio cyclic CV modulation waveforms (sine, square, sawtooth, triangle) with hard sync reset.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Reset In** | `voltage` | Hard sync phase reset trigger. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV Out** | `voltage` | LFO CV modulation signal. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frequency (Hz)** | `slider` | `0.01` to `20` (step: `0.01`) | `1` | LFO cycle rate in Hz. |
| **Fine Rate (Hz)** | `slider` | `-0.5` to `0.5` (step: `0.01`) | `0` | Fine frequency tuning offset. |
| **Waveform** | `select` | `sine`, `square`, `sawtooth`, `triangle` | `sine` | LFO modulation shape. |
| **Amplitude** | `slider` | `0` to `1` (step: `0.01`) | `1` | Peak CV output level. |

## Code Details & Nuances

* Fine Rate allows sub-Hz precision control down to 0.01 Hz.

