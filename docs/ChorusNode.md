# Chorus Node

**Category:** `Effects`
**Class:** `ChorusNode`

Stereo chorus effect modulating dual delay lines with inverse LFO phases to create pitch detuned ensemble thickness.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio signal. |
| **Rate CV** | `voltage` | LFO modulation rate CV. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Stereo chorus output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Rate (Hz)** | `slider` | `0.1` to `10` (step: `0.1`) | `1.5` | Modulation rate speed. |
| **Depth** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Modulation delay depth. |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Dry/wet mix balance. |

## Code Details & Nuances

* Uses dual LFO-modulated delay lines with anti-phase LFO offsets for wide stereo motion.
