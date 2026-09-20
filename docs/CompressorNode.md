# Compressor Node

**Category:** `Effects`
**Class:** `CompressorNode`

Dynamic range compressor controlling audio peak spikes with adjustable threshold, ratio, attack, and release.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Input audio. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio Out** | `voltage` | Compressed audio output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Threshold (dB)** | `slider` | `-60` to `0` (step: `1`) | `-24` | Compression activation threshold. |
| **Ratio** | `slider` | `1` to `20` (step: `0.1`) | `4` | Compression ratio. |
| **Attack (s)** | `slider` | `0.001` to `1` (step: `0.001`) | `0.003` | Attack time. |
| **Release (s)** | `slider` | `0.01` to `1` (step: `0.01`) | `0.25` | Release time. |

## Code Details & Nuances

* Uses Web Audio DynamicsCompressorNode engine.

