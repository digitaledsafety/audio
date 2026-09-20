# Distortion Node

**Category:** `Effects`
**Class:** `DistortionNode`

Waveshaper distortion effect providing Soft Clipping, Hard Clipping, and Fuzz algorithms with drive CV control.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |
| **Drive CV** | `voltage` | Drive modulation CV. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Distorted audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Drive** | `slider` | `0` to `100` (step: `1`) | `20` | Distortion intensity drive. |
| **Type** | `select` | `soft`, `hard`, `fuzz` | `soft` | Distortion curve algorithm. |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `1` | Dry/wet mix level. |

## Code Details & Nuances

* Uses precomputed 4096-point Float32Array waveshaper transfer curves for zero-latency distortion.

