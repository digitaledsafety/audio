# Sequencer Node

**Category:** `Modulation & Sequencing`
**Class:** `SequencerNode`

Multi-step step sequencer supporting 4 to 64 steps, algorithmic pattern generators, and dual Gate and CV outputs.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Clock In** | `voltage` | Step trigger clock pulse input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Gate Out** | `voltage` | Trigger gate signal per step. |
| **CV Out** | `voltage` | Pitch CV signal per step. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **BPM** | `slider` | `40` to `240` (step: `1`) | `120` | Tempo in BPM. |
| **Step Length** | `slider` | `4` to `64` (step: `1`) | `32` | Total sequence step length. |
| **Gen Pattern** | `select` | `Up`, `Down`, `Up-Down`, `Down-Up`, `Scalar Walk`, `Motif Generator`, `Pentatonic Groove`, `Random` | `Up` | Algorithmic pattern generator. |
| **Mode** | `select` | `Scale`, `Chord` | `Scale` | Scale or chord quantization mode. |

## Code Details & Nuances

* Supports step length from 4 to 64 steps with automatic reset on start/stop.

