# Visualizer Node

**Category:** `Utilities`
**Class:** `VisualizerNode`

Real-time oscilloscope, frequency spectrum analyzer, and vectorscope display using WebGL and Canvas API.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Audio or modulation signal to visualize. |

## Outputs

*This node has no outputs.*

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Mode** | `select` | `Oscilloscope`, `Spectrum`, `Vectorscope` | `Oscilloscope` | Visualization display mode. |

## Code Details & Nuances

* Renders real-time waveform or FFT spectrum using WebGL / Canvas API.
* Can be globally disabled via Settings toggle to reduce CPU/GPU resource consumption.
