# Flanger Node

The **Flanger Node** generates a comb-filtering flanging effect by sweeping a short delay line modulated by an LFO with feedback.

## Inputs

- **Audio In**: Main audio signal input.
- **Rate CV**: Control voltage input to modulate modulation LFO rate.

## Outputs

- **Audio Out**: Processed flanged audio output.

## Controls

- **Rate (Hz)**: LFO sweep frequency (0.01 Hz to 10 Hz, default 0.2 Hz).
- **Depth (s)**: LFO delay modulation amplitude (0s to 0.01s, default 0.002s).
- **Delay (s)**: Base flanger delay time (0.001s to 0.02s, default 0.005s).
- **Feedback**: Resonant feedback amount returned to the delay line (0.0 to 0.95, default 0.5).
- **Mix**: Dry/wet signal blend ratio (0.0 dry to 1.0 wet, default 0.5).
