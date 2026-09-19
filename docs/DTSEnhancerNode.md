# DTS Enhancer Node

The **DTS Enhancer Node** is a multi-band audio enhancement processor designed to add dynamic punch, high-frequency clarity, and sub-bass Low-Frequency Effects (LFE) channel routing.

## Inputs

- **Audio In**: Main audio signal input.

## Outputs

- **Audio Out**: Processed high/mid enhanced audio output.
- **LFE Out**: Dedicated low-frequency effect subwoofer output signal filtered by the LFE cutoff filter.

## Controls

- **Punch (dB)**: Low-end presence and transient enhancement boost/cut (-20 dB to +20 dB, default 0 dB).
- **Clarity (dB)**: High-frequency excitation and brightness boost/cut (-20 dB to +20 dB, default 0 dB).
- **LFE Cutoff (Hz)**: Low-pass cutoff frequency for LFE subwoofer output routing (20 Hz to 500 Hz, default 80 Hz).
- **LFE Gain**: Output gain for LFE subwoofer output channel (0.0 to 2.0, default 1.0).
