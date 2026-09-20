# Flanger Node

The **Flanger Node** produces sweeping comb-filtering jet audio effects by mixing the input signal with a short, variable delay line with regenerative feedback.

## Inputs

- **Audio In**: Main audio signal input.
- **Rate CV**: Control voltage input to modulate the flanger LFO rate dynamically.

## Outputs

- **Audio Out**: Processed flanged audio output.

## Controls

- **Rate (Hz)**: Sets LFO rate for delay modulation (0.01 to 10.0 Hz, default 0.2 Hz).
- **Depth (s)**: Adjusts depth of delay modulation (0.0 to 0.01 seconds, default 0.002 seconds).
- **Delay (s)**: Base delay offset time (0.001 to 0.02 seconds, default 0.005 seconds).
- **Feedback**: Regenerative feedback ratio fed back into the delay line (0.0 to 0.95, default 0.5).
- **Mix**: Dry/wet mix ratio (0.0 to 1.0, default 0.5). Automatically forced to 1.0 (100% wet) when placed inside a feedback loop cycle.
