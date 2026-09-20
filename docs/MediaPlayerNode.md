# Media Player Node

**Category:** `Sources`
**Class:** `MediaPlayerNode`

Multi-format sample player capable of loading external audio files (WAV, MP3, OGG, FLAC, WebM) via URL with speed, pitch, reverse, and looping controls.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Gate In** | `voltage` | Gate signal input to trigger or stop sample playback. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Stereo/mono decoded sample audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Sample URL** | `text` | Text String | `` | URL of audio file. |
| **Speed** | `slider` | `0.1` to `4` (step: `0.01`) | `1` | Playback speed multiplier. |
| **Pitch (semitones)** | `slider` | `-12` to `12` (step: `1`) | `0` | Pitch transposition in semitones. |
| **Reverse** | `checkbox` | `true` / `false` | `false` | Reverses audio buffer playback direction. |
| **Loop** | `checkbox` | `true` / `false` | `false` | Loops audio continuously when playback ends. |
| **Gain** | `slider` | `0` to `2` (step: `0.01`) | `1` | Output volume gain. |

## Code Details & Nuances

* Replaces legacy WavePlayerNode while maintaining full backward workspace file compatibility.
* Audio samples are decoded asynchronously into AudioBuffer instances.

