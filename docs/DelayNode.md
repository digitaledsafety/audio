# Delay Node

**Category:** `Effects`
**Class:** `DelayNode`

Audio delay effect with adjustable delay time, feedback repeats, and dry/wet mix balance.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio signal. |
| **Time CV** | `voltage` | Delay time modulation input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Delayed audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Time (s)** | `slider` | `0.001` to `2` (step: `0.001`) | `0.3` | Delay time in seconds. |
| **Feedback** | `slider` | `0` to `0.95` (step: `0.01`) | `0.4` | Feedback repeat gain. |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Dry/wet mix balance. |

## Code Details & Nuances

* Feedback capped at 0.95 to prevent runaway oscillation.
* Minimum delay time clamped to 1 render quantum (128 samples) when included in cyclic loops.

