# Phaser Node

**Category:** `Effects`
**Class:** `PhaserNode`

Multi-stage phaser cascading four all-pass filters modulated by LFO sweep to generate sweeping notch phase cancellation.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |
| **Rate CV** | `voltage` | Sweep rate CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Phased audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Rate (Hz)** | `slider` | `0.1` to `10` (step: `0.1`) | `0.5` | Modulation sweep frequency. |
| **Depth** | `slider` | `0` to `1` (step: `0.01`) | `0.7` | Filter frequency sweep depth. |
| **Feedback** | `slider` | `0` to `0.9` (step: `0.01`) | `0.5` | Resonance feedback. |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Dry/wet mix balance. |

## Code Details & Nuances

* Cascades 4 all-pass filter stages modulated by an internal LFO to produce notch sweeping.
