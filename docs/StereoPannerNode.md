# Stereo Panner Node

**Category:** `Effects`
**Class:** `StereoPannerNode`

Panoramic audio balance node positioning audio across left/right stereo spectrum manually or via CV modulation.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |
| **Pan CV** | `voltage` | Stereo pan CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Stereo panned output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Pan** | `slider` | `-1` to `1` (step: `0.01`) | `0` | Pan position (-1 left, 0 center, +1 right). |

## Code Details & Nuances

* Uses StereoPannerNode API when supported, falling back to equal-power GainNode split.

