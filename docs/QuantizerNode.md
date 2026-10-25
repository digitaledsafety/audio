# Quantizer Node

The Quantizer Node processes incoming control voltages (CV) or pitch signals and constrains them to discrete semitone intervals corresponding to a selected musical key and scale.

## Inputs

| Name      | Description                                                                 |
| --------- | --------------------------------------------------------------------------- |
| **CV In** | Continuous or unquantized control voltage input (1V/Octave standard).       |

## Outputs

| Name       | Description                                                                |
| ---------- | -------------------------------------------------------------------------- |
| **CV Out** | Quantized control voltage output constrained to the nearest scale degree.   |

## Controls

| Name          | Description                                                                |
| ------------- | -------------------------------------------------------------------------- |
| **Root Note** | Specifies the root key (e.g., C4, D4, F#4) for pitch quantization.        |
| **Scale**     | Selects the scale type (e.g., Major (Ionian), Minor (Aeolian), Pentatonic). |
