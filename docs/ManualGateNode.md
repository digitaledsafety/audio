# Gate Node

**Category:** `Modulation & Sequencing`
**Class:** `ManualGateNode`

Manual Gate and Trigger generator producing high (1.0) or low (0.0) control voltage signals for envelopes, sequencers, or clock inputs.

## Inputs

*This node has no inputs.*

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Gate Out** | `voltage` | Outputs gate high (1.0) voltage signal when active and low (0.0) when inactive. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Gate / Trigger** | `button` | Toggle / Momentary | `off` | Manual toggle or hold button to activate gate signal. |

## Code Details & Nuances

* Disconnecting gate outputs restores target nodes to default High (true) gate state via VoltageConnectionStrategy.
