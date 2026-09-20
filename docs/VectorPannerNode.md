# Vector Panner Node

**Category:** `Effects`
**Class:** `VectorPannerNode`

2D quad-panning matrix node mixing four audio input channels into a stereo output based on X/Y Cartesian coordinates.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Input A** | `voltage` | Audio input channel A (Top-Left). |
| **Input B** | `voltage` | Audio input channel B (Top-Right). |
| **Input C** | `voltage` | Audio input channel C (Bottom-Left). |
| **Input D** | `voltage` | Audio input channel D (Bottom-Right). |
| **CV X** | `voltage` | Control voltage modulating X position. |
| **CV Y** | `voltage` | Control voltage modulating Y position. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Out Left** | `voltage` | Left channel output. |
| **Out Right** | `voltage` | Right channel output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Position X** | `slider` | `-1` to `1` (step: `0.01`) | `0` | X coordinate positioning (-1 to +1). |
| **Position Y** | `slider` | `-1` to `1` (step: `0.01`) | `0` | Y coordinate positioning (-1 to +1). |

## Code Details & Nuances

* Uses 2D quad-panning gain matrix calculations to mix 4 input sources into stereo output.
