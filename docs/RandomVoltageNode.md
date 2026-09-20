# Random Voltage Node

**Category:** `Modulation & Sequencing`
**Class:** `RandomVoltageNode`

Stepped random control voltage generator producing new random values within configured voltage bounds on clock triggers.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Clock In** | `voltage` | Clock trigger input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV Out** | `voltage` | Stepped random CV output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Min Volts** | `slider` | `-5` to `5` (step: `0.1`) | `0` | Minimum random voltage bound. |
| **Max Volts** | `slider` | `-5` to `5` (step: `0.1`) | `5` | Maximum random voltage bound. |

## Code Details & Nuances

* Generates new random voltage bound between Min Volts and Max Volts on each rising clock edge.
