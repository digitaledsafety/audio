# Flanger Node

**Category:** `Effects`
**Class:** `FlangerNode`

Short delay flanging effect with feedback and LFO rate modulation producing resonant jet-plane comb filter sweeps.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |
| **Rate CV** | `voltage` | Modulation sweep rate CV. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Flanged audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Rate (Hz)** | `slider` | `0.05` to `5` (step: `0.01`) | `0.2` | LFO sweep speed. |
| **Depth (ms)** | `slider` | `0.1` to `10` (step: `0.1`) | `2` | Delay time modulation depth in ms. |
| **Feedback** | `slider` | `0` to `0.95` (step: `0.01`) | `0.5` | Feedback repeat gain. |
| **Mix** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Dry/wet mix balance. |

## Code Details & Nuances

* Short delay times (1-10ms) produce comb filtering jet-plane sweep textures.
