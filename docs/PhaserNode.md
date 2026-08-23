# Phaser Node

The **Phaser Node** creates sweeping notch-filter phaser effects by passing audio through a cascade of all-pass filters swept by an internal LFO.

## Inputs

- **Audio In**: Main audio signal input.
- **Rate CV**: Control voltage input to modulate phaser sweep rate dynamically.

## Outputs

- **Audio Out**: The phaser-processed audio output signal.

## Controls

- **Rate (Hz)**: LFO sweep frequency (0.1 Hz to 10 Hz, default 0.5 Hz).
- **Feedback**: Internal feedback level (0.0 to 0.9, default 0.5) for deepening resonant notch filter sweeps.
- **Base Freq (Hz)**: Center frequency for the all-pass filter network (100 Hz to 5000 Hz, default 1000 Hz).
- **Mix**: Dry/Wet blend slider (0.0 to 1.0, default 0.5).
