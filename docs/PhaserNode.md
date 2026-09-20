# Phaser Node

The **Phaser Node** creates sweeping notch-filtering audio effects by passing the audio signal through a series of all-pass filters modulated by an LFO.

## Inputs

- **Audio In**: Main audio signal input.
- **Rate CV**: Control voltage input to modulate the phaser LFO rate dynamically.

## Outputs

- **Audio Out**: Processed phaser audio output.

## Controls

- **Rate (Hz)**: LFO modulation speed (0.01 to 10.0 Hz, default 0.5 Hz).
- **Depth**: Sweeping frequency range depth (0 to 2000, default 1000).
- **Base Freq (Hz)**: Center base frequency for the all-pass filter cascade (20 to 2000 Hz, default 700 Hz).
- **Feedback**: Resonance feedback ratio for notch intensity (0.0 to 0.95, default 0.5).
- **Mix**: Dry/wet mix ratio (0.0 to 1.0, default 0.5). Automatically forced to 1.0 (100% wet) when placed inside a feedback loop cycle.
