# Bernoulli Gate Node

**Category:** `Modulation & Sequencing`
**Class:** `BernoulliGateNode`

Probabilistic gate router that stochastically directs incoming gate pulses to Output A or Output B based on probability.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Gate In** | `voltage` | Incoming clock or trigger pulse. |
| **Prob CV** | `voltage` | CV modulating probability distribution. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Out A** | `voltage` | Triggered when coin toss resolves to A. |
| **Out B** | `voltage` | Triggered when coin toss resolves to B. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Probability (A/B)** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Probability balance (0.0 = 100% B, 0.5 = 50/50, 1.0 = 100% A). |

## Code Details & Nuances

* Stochastically routes input gate pulses to Out A or Out B based on weighted probability.
