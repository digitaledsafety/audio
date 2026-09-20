# VCO Node

**Category:** `Sources`
**Class:** `ToneGeneratorNode`

Voltage Controlled Oscillator generating fundamental audio waveforms (sine, square, sawtooth, triangle) with pitch fine-tuning and CV pitch modulation.

## Inputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Freq CV** | `voltage` | Frequency control voltage modulation input (1V/Octave standard). |
| **MIDI In** | `midi` | MIDI input stream for setting frequency notes. |

## Outputs

| Socket Name | Socket Type | Description |
| :--- | :--- | :--- |
| **Audio** | `voltage` | Main audio output signal. |

## Controls & Parameters

| Control | Type | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frequency (Hz)** | `slider` | `20` to `20000` (step: `1`) | `440` | Base oscillator frequency in Hz. |
| **Fine Tune (cents)** | `slider` | `-100` to `100` (step: `1`) | `0` | Fine pitch offset in cents (+/-1 semitone). |
| **Waveform** | `select` | `sine`, `square`, `sawtooth`, `triangle` | `sine` | Oscillator output waveform shape. |

## Code Details & Nuances

* Incoming MIDI notes override manual frequency slider setting.
* Fine tuning uses 2^(cents/1200) multiplier for exact pitch offsets.
