# Inverter Node

**Category:** `Utilities`
**Class:** `SignalInverterNode`

Signal phase inversion utility multiplying incoming audio or control voltage by -1.0x.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **In** | `voltage` | Input signal. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Out** | `voltage` | Inverted polarity output signal. |

## Controls & Parameters

*This node has no interactive UI controls.*

## Code Details & Nuances

* Multiplies input polarity by -1.0 across both audio and CV signals.
