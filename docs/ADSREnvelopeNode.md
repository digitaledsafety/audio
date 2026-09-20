# EG Node

**Category:** `Modulation & Sequencing`
**Class:** `ADSREnvelopeNode`

ADSR Envelope Generator generating Attack, Decay, Sustain, and Release contour signals for VCAs and VCFs.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Gate In** | `voltage` | Gate trigger pulse input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV Out** | `voltage` | Envelope CV signal. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Mode** | `select` | `EG`, `GATE`, `LFO` | `EG` | Operational mode (Envelope Generator, Gate, or auto LFO). |
| **Attack (s)** | `slider` | `0.001` to `2` (step: `0.001`) | `0.01` | Attack duration. |
| **Decay (s)** | `slider` | `0.001` to `2` (step: `0.001`) | `0.1` | Decay duration. |
| **Sustain** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Sustain level. |
| **Release (s)** | `slider` | `0.001` to `5` (step: `0.001`) | `0.2` | Release duration. |

## Code Details & Nuances

* Exponential curve ramping on attack and release prevents audio pop artifacts.
