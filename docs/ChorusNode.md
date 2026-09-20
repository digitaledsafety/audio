# Chorus Node

The **Chorus Node** adds warmth, dimension, and spatial thickness to audio signals by mixing the original dry audio with short, LFO-modulated delayed copies.

## Inputs

- **Audio In**: Main audio signal input.
- **Rate CV**: Control voltage input to modulate the chorus LFO rate dynamically.

## Outputs

- **Audio Out**: The processed audio output blending dry and modulated wet delay signals.

## Controls

- **Rate (Hz)**: Controls the low-frequency oscillator (LFO) modulation speed (0.1 to 10.0 Hz, default 1.5 Hz).
- **Depth (s)**: Adjusts the depth of delay time modulation (0.0 to 0.01 seconds, default 0.002 seconds).
- **Delay (s)**: Sets the base delay offset time (0.01 to 0.10 seconds, default 0.03 seconds).
- **Mix**: Sets the dry/wet balance ratio (0.0 to 1.0, default 0.5). Automatically forced to 1.0 (100% wet) when placed inside a feedback loop cycle.
