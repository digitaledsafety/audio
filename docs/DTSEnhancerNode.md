# DTS Enhancer Node

The **DTS Enhancer Node** provides surround and low-frequency audio enhancement, incorporating punch sub-bass boost, high-frequency clarity enhancement, and a dedicated Low-Frequency Effects (LFE) sub-woofer output channel with customizable crossover filter cutoff and gain.

## Inputs

- **Audio In**: Main audio signal input.

## Outputs

- **Audio Out**: The enhanced main audio output signal.
- **LFE Out**: Dedicated Low-Frequency Effects output signal filtered by the LFE cutoff frequency.

## Controls

- **Punch (dB)**: Sub-bass low-end boost or attenuation (-20.0 to +20.0 dB, default 0.0 dB).
- **Clarity (dB)**: High-frequency presence boost or attenuation (-20.0 to +20.0 dB, default 0.0 dB).
- **LFE Cutoff (Hz)**: Low-pass crossover frequency for the dedicated LFE output (20 to 500 Hz, default 80 Hz).
- **LFE Gain**: Output gain scaling for the dedicated LFE channel (0.0 to 2.0, default 1.0).
