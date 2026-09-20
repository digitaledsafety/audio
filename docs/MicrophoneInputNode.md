# 🎤 Mic Input Node

**Category:** `Sources`
**Class:** `MicrophoneInputNode`

Microphone audio stream input capturing live acoustic or vocal sound from the user media device.

## Inputs

*This node has no inputs.*

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Live audio stream output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Gain** | `slider` | `0` to `2` (step: `0.01`) | `1` | Microphone input gain adjustment. |

## Code Details & Nuances

* Requires user microphone permission in browser.
* Uses navigator.mediaDevices.getUserMedia and web audio MediaStreamAudioSourceNode.

