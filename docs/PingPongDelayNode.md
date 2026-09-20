# Ping Pong Delay Node

**Category:** `Effects`
**Class:** `PingPongDelayNode`

Stereo delay effect alternating echo repeats between left and right output channels.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |
| **Time CV** | `voltage` | Delay time CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Stereo ping-pong delayed output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Time (s)** | `slider` | `0.001` to `2` (step: `0.001`) | `0.3` | Delay time in seconds. |
| **Feedback** | `slider` | `0` to `0.95` (step: `0.01`) | `0.4` | Stereo feedback level. |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Dry/wet mix level. |

## Code Details & Nuances

* Alternates repeats between left and right channels using dual cross-fed delay lines.
