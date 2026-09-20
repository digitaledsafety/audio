# Sample & Hold Node

**Category:** `Modulation & Sequencing`
**Class:** `SampleAndHoldNode`

Sample & Hold circuit capturing instant voltage levels from an input signal upon receiving a trigger pulse.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Signal In** | `voltage` | Signal to sample. |
| **Trigger In** | `voltage` | Trigger pulse input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV Out** | `voltage` | Held voltage level output. |

## Controls & Parameters

*This node has no interactive UI controls.*

## Code Details & Nuances

* Captures input voltage on rising edge of trigger signal and maintains constant output until next trigger.
