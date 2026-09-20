# Attenuverter Node

**Category:** `Utilities`
**Class:** `AttenuverterNode`

Precision scale and polarity inversion node for scaling or flipping control voltages between -1.0x and +1.0x.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **In** | `voltage` | Input signal. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Out** | `voltage` | Scaled or inverted output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Level** | `slider` | `-1` to `1` (step: `0.01`) | `1` | Gain multiplier (-1 to +1). |

## Code Details & Nuances

* At 0.0 mutes signal; at +1.0 passes unchanged; at -1.0 flips phase polarity.

