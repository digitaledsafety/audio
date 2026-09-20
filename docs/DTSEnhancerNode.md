# DTS Enhancer Node

**Category:** `Effects`
**Class:** `DTSEnhancerNode`

Audio enhancement node providing spectral brightness equalization and dynamic multi-band presence processing.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio signal. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Enhanced audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Enhancement** | `slider` | `0` to `100` (step: `1`) | `50` | Spectral brightness and stereo widening intensity. |
| **Mode** | `select` | `Music`, `Movie`, `Voice` | `Music` | Presets EQ profile and dynamic response. |

## Code Details & Nuances

* Processes signal through custom multi-band dynamic gain and equalization filters.
