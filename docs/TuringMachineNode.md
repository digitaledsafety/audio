# Turing Machine Node

**Category:** `Modulation & Sequencing`
**Class:** `TuringMachineNode`

Random looping shift register generating evolving or locked rhythmic and melodic control voltage patterns.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Clock In** | `voltage` | Clock input pulse to step register. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV Out** | `voltage` | Stepped control voltage output. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Randomness** | `slider` | `0` to `1` (step: `0.01`) | `0.5` | Chance of flipping register bits on step (0 = locked sequence, 1 = total random). |
| **Sequence Length** | `slider` | `2` to `16` (step: `1`) | `8` | Shift register sequence step length. |

## Code Details & Nuances

* At 0.0 randomness, loops exact repeating pattern. At 0.5, randomly mutates register bits.
