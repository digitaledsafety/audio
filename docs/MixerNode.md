# Mixer Node

**Category:** `Effects`
**Class:** `MixerNode`

4-channel audio and CV utility mixer with independent channel gain controls and master gain output level.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Ch 1** | `voltage` | Channel 1 input. |
| **Ch 2** | `voltage` | Channel 2 input. |
| **Ch 3** | `voltage` | Channel 3 input. |
| **Ch 4** | `voltage` | Channel 4 input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Mix Out** | `voltage` | Summed master output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Ch 1 Level** | `slider` | `0` to `1` (step: `0.01`) | `0.8` | Channel 1 gain. |
| **Ch 2 Level** | `slider` | `0` to `1` (step: `0.01`) | `0.8` | Channel 2 gain. |
| **Ch 3 Level** | `slider` | `0` to `1` (step: `0.01`) | `0.8` | Channel 3 gain. |
| **Ch 4 Level** | `slider` | `0` to `1` (step: `0.01`) | `0.8` | Channel 4 gain. |
| **Master Level** | `slider` | `0` to `1` (step: `0.01`) | `1` | Master output gain. |

## Code Details & Nuances

* Summed channels pass through master gain before output. Key component for feedback routing loops.
