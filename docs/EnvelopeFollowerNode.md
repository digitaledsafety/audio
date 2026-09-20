# Envelope Follower Node

**Category:** `Modulation & Sequencing`
**Class:** `EnvelopeFollowerNode`

Dynamic amplitude tracker generating control voltage proportional to the peak envelope of incoming audio.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Audio input stream. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV Out** | `voltage` | Envelope CV signal. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Sensitivity** | `slider` | `0` to `10` (step: `0.1`) | `1` | Input sensitivity multiplier. |
| **Attack (s)** | `slider` | `0.001` to `1` (step: `0.001`) | `0.01` | Envelope rise speed. |
| **Release (s)** | `slider` | `0.001` to `1` (step: `0.001`) | `0.1` | Envelope decay speed. |

## Code Details & Nuances

* Converts dynamic audio volume peaks into continuous control voltage signals.

