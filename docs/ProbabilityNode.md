# Probability Node

**Category:** `Modulation & Sequencing`
**Class:** `ProbabilityNode`

Stochastic gate filter that allows gate pulses to pass through based on a configurable probability percentage.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Gate In** | `voltage` | Input gate or trigger pulse. |
| **Prob CV** | `voltage` | CV modulating probability threshold. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Gate Out** | `voltage` | Probabilistically passed gate signal. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Probability** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Probability pass rate (0.0 = blocked, 1.0 = always passed). |

## Code Details & Nuances

* Shares single-sample buffer for optimized memory polling during signal processing.

