# VCA Node

**Category:** `Modulation & Sequencing`
**Class:** `VCANode`

Voltage Controlled Amplifier controlling audio or control voltage amplitude via manual gain and CV modulation.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **In** | `voltage` | Audio or CV input signal. |
| **CV In** | `voltage` | Control voltage modulating VCA gain. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Out** | `voltage` | Amplified or attenuated output signal. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Gain** | `slider` | `0` to `1` (step: `0.01`) | `1` | Manual base gain level. |
| **CV Amount** | `slider` | `0` to `1` (step: `0.01`) | `1` | Depth of CV input modulation. |

## Code Details & Nuances

* Operates as a linear multiplier for both audio signals and DC control voltages.

