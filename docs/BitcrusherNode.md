# Bitcrusher Node

**Category:** `Effects`
**Class:** `BitcrusherNode`

Lo-fi digital bit crusher reducing bit depth resolution and sample rate frequency for vintage digital crunch.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |
| **Bits CV** | `voltage` | Bit depth CV modulation. |
| **SR CV** | `voltage` | Sample rate reduction CV modulation. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Bitcrushed audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Bit Depth** | `slider` | `1` to `16` (step: `1`) | `8` | Bit resolution (1 to 16 bits). |
| **Sample Rate Reduction** | `slider` | `1` to `20` (step: `0.1`) | `1` | Downsampling factor. |

## Code Details & Nuances

* Powered by BitcrusherProcessor AudioWorklet. Per-channel phase arrays prevent multi-channel cross-bleeding.

