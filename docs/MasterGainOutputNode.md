# Output Node

**Category:** `Utilities`
**Class:** `MasterGainOutputNode`

Master output node connecting synthesizer patch audio directly to Web Audio output speakers.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio In** | `voltage` | Main audio mix input. |

## Outputs

*This node has no outputs.*

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Master Volume** | `slider` | `0` to `1` (step: `0.01`) | `0.8` | Global output volume level. |

## Code Details & Nuances

* Connects directly to Web Audio destination speaker output and global master gain.
