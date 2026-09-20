# Stereo Widener Node

**Category:** `Effects`
**Class:** `StereoWidenerNode`

Stereo width expansion effect utilizing Mid/Side (M/S) matrix signal processing to expand or narrow spatial image.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio signal. |
| **Width CV** | `voltage` | Modulates stereo width coefficient. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Broadened stereo audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Width** | `slider` | `0` to `2` (step: `0.01`) | `1` | Stereo image width (0 = mono, 1 = normal, 2 = wide). |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `1` | Dry/wet mix level. |

## Code Details & Nuances

* Automatic feedback mix clamping sets mix to 1.0 when included in a cyclic feedback loop.
