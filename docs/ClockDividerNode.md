# Clock Divider Node

**Category:** `Modulation & Sequencing`
**Class:** `ClockDividerNode`

Frequency divider producing sub-divided clock pulse signals (/2, /4, /8, /16) from a master clock input.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Clock In** | `voltage` | Main clock input pulse stream. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **/2 Out** | `voltage` | Clock divided by 2. |
| **/4 Out** | `voltage` | Clock divided by 4. |
| **/8 Out** | `voltage` | Clock divided by 8. |
| **/16 Out** | `voltage` | Clock divided by 16. |

## Controls & Parameters

*This node has no interactive UI controls.*

## Code Details & Nuances

* Sub-divided outputs trigger synchronously on rising edges of incoming clock ticks.
