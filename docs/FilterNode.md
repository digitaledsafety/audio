# VCF Node

**Category:** `Effects`
**Class:** `FilterNode`

Voltage Controlled Filter featuring Lowpass, Highpass, Bandpass, and Notch modes with cutoff frequency and resonance control.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio signal. |
| **Cutoff CV** | `voltage` | Cutoff frequency CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Filtered audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Cutoff (Hz)** | `slider` | `20` to `20000` (step: `1`) | `1000` | Filter cutoff frequency. |
| **Filter Type** | `select` | `lowpass`, `highpass`, `bandpass`, `notch` | `lowpass` | Filter frequency response type. |
| **Resonance (Q)** | `slider` | `0.1` to `20` (step: `0.1`) | `1` | Filter resonance peak. |

## Code Details & Nuances

* Cutoff CV uses logarithmic frequency scaling.
* Resonance values near 20 approach self-oscillation.
