# Stereo Widener Node

The **Stereo Widener Node** uses Mid/Side (M/S) matrix processing to adjust the perceived stereo width and side-signal gain of audio signals.

## Inputs

- **Audio In**: Main audio signal input.
- **Width CV**: Control voltage input to dynamically modulate stereo width.

## Outputs

- **Audio Out**: Stereo widened/narrowed audio output.

## Controls

- **Width**: Adjusts stereo width multiplier (0.0 for mono downmix, 1.0 for standard stereo, up to 4.0 for exaggerated spatial width, default 1.0).
- **Mix**: Dry/wet mix level (0.0 to 1.0, default 1.0). Automatically forced to 1.0 (100% wet) when placed inside a feedback loop cycle.
