# Reverb Node

**Category:** `Effects`
**Class:** `ReverbNode`

Algorithmic convolution reverb simulating spatial acoustic echo environments with decay time and CV control.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |
| **Decay CV** | `voltage` | Decay time CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Reverberated audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Decay Time (s)** | `slider` | `0.1` to `10` (step: `0.1`) | `2` | Reverb decay duration in seconds. |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `0.3` | Dry/wet mix level. |

## Code Details & Nuances

* Generates synthetic impulse response buffer with exponentially decaying noise.
