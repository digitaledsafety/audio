# Flanger Node

The **Flanger Node** generates resonant comb-filtering and jet-plane sweep effects by sweeping short delay times using an internal LFO with feedback.

## Inputs

- **Audio In**: Main audio signal input.
- **Rate CV**: Control voltage input to modulate flanger sweep rate.

## Outputs

- **Audio Out**: The flanger-processed audio output signal.

## Controls

- **Rate (Hz)**: LFO sweep rate (0.05 Hz to 5 Hz, default 0.2 Hz).
- **Depth**: Delay modulation range (0.001 s to 0.01 s, default 0.005 s).
- **Feedback**: Comb-filter feedback amount (-0.9 to 0.9, default 0.5).
- **Mix**: Dry/Wet blend slider (0.0 to 1.0, default 0.5).
