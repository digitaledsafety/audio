# Logic Gates Node

**Category:** `Modulation & Sequencing`
**Class:** `LogicGatesNode`

Digital Boolean logic gate performing AND, OR, XOR, NAND, NOR, and XNOR operations on dual gate inputs.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **In A** | `voltage` | Digital gate input A. |
| **In B** | `voltage` | Digital gate input B. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Out** | `voltage` | Boolean operation output gate pulse. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Logic Function** | `select` | `AND`, `OR`, `XOR`, `NAND`, `NOR`, `XNOR` | `AND` | Boolean logic truth operation. |

## Code Details & Nuances

* Evaluates gate input high threshold at > 0.5V.

