# Clock Node

**Category:** `Utilities`
**Class:** `MasterClockNode`

Master clock pulse generator driving tempo synchronization across sequencers, drum machines, and arpeggiators.

## Inputs

*This node has no inputs.*

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Clock Out** | `voltage` | Master clock pulse stream. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **BPM** | `slider` | `30` to `300` (step: `1`) | `120` | Tempo in beats per minute. |

## Code Details & Nuances

* Sends precision clock pulses on every tick.
* Resets tick counter on transport restart and editor clear.
