# DTS Enhancer Node

The **DTS Enhancer Node** is a spatial and frequency enhancement processor designed to sculpt audio presence, low-end punch, and high-end clarity while generating a dedicated Low-Frequency Effects (LFE) channel output.

## Inputs

- **Audio In**: The main audio signal to be enhanced and split.

## Outputs

- **Audio Out**: The enhanced main audio output signal with punch and clarity filter processing applied.
- **LFE Out**: Dedicated Low-Frequency Effects output containing the low-pass filtered audio signal.

## Controls

- **Punch (dB)**: Low-shelf filter gain control (-20 dB to +20 dB) centered at 200 Hz for adjusting sub-bass and low-end warmth.
- **Clarity (dB)**: High-shelf filter gain control (-20 dB to +20 dB) centered at 3000 Hz for enhancing treble definition and presence.
- **LFE Cutoff (Hz)**: Low-pass filter cutoff frequency (20 Hz to 500 Hz, default 80 Hz) for the dedicated LFE output channel.
- **LFE Gain**: Volume level control (0.0 to 2.0, default 1.0) for the LFE channel output.
