# Quantizer Node

**Category:** `Modulation & Sequencing`
**Class:** `QuantizerNode`

Pitch quantizer constraining continuous unquantized CV signals to exact semitones of selected musical scales.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV In** | `voltage` | Unquantized control voltage input. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **CV Out** | `voltage` | Quantized 1V/Oct CV output signal. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Root Note** | `select` | `C`, `C#`, `D`, `D#`, `E`, `F`, `F#`, `G`, `G#`, `A`, `A#`, `B` | `C4` | Root key. |
| **Scale** | `select` | `Major (Ionian)`, `Natural Minor (Aeolian)`, `Dorian`, `Phrygian`, `Lydian`, `Mixolydian`, `Locrian`, `Pentatonic Major`, `Pentatonic Minor`, `Blues` | `Major (Ionian)` | Target musical scale constraint. |

## Code Details & Nuances

* Snaps continuous voltage values to nearest semitone in the selected musical scale.
