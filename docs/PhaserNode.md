# Phaser Node

The **Phaser Node** creates sweeping notch filter phase shifts across the frequency spectrum using cascading all-pass filter stages and LFO modulation.

## Inputs

- **Audio In**: Main audio signal input.
- **Rate CV**: Control voltage input to modulate modulation LFO rate.

## Outputs

- **Audio Out**: Phased audio signal output.

## Controls

- **Rate (Hz)**: LFO sweep modulation speed (0.01 Hz to 10 Hz, default 0.5 Hz).
- **Depth**: Filter notch sweep depth intensity (0.0 to 1.0, default 0.7).
- **Base Freq (Hz)**: Center frequency of the phase notches (20 Hz to 2000 Hz, default 700 Hz).
- **Feedback**: Resonance feedback across the all-pass cascade (0.0 to 0.95, default 0.5).
- **Mix**: Dry/wet signal blend ratio (0.0 dry to 1.0 wet, default 0.5).
