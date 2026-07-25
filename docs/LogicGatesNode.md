# Logic Gates Node

The **Logic Gates Node** is a utility that performs logical operations on two gate inputs (digital voltages: High or Low) and outputs the logical result. It is an essential building block for building algorithmic rhythms, generative logic, or complex event-routing pathways in a modular patch.

## Inputs

- **Gate A**: The first boolean signal input. Any positive voltage/High signal is treated as `true`, while 0V/Low is treated as `false`.
- **Gate B**: The second boolean signal input. Follows the same digital logical convention as Gate A.

## Outputs

- **Gate Out**: The output signal representing the boolean result of the selected logic operation. It outputs 1V (High) when the logical condition is met and 0V (Low) when it is not.

## Controls

- **Operation**: Selects the logical operation to be applied to the two inputs. The available operations include:
  - **AND**: Outputs High only when *both* Gate A and Gate B are High.
  - **OR**: Outputs High if *either* Gate A or Gate B (or both) are High.
  - **XOR** (Exclusive OR): Outputs High if Gate A and Gate B are *different* (one is High, one is Low).
  - **NAND**: The negation of AND. Outputs Low only when *both* inputs are High.
  - **NOR**: The negation of OR. Outputs High only when *both* inputs are Low.
  - **XNOR**: The negation of XOR. Outputs High when Gate A and Gate B are *identical*.
