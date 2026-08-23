# Stereo Widener Node

The **Stereo Widener Node** enhances the perceived spatial stereo width of audio signals using Mid-Side (M/S) matrix processing. It separates input audio into Mid (center) and Side (stereo difference) components to expand stereo field breadth without introducing phase artifacts.

## Inputs

- **Audio In**: Main stereo or mono audio input.
- **Width CV**: Control voltage input to dynamically modulate stereo field width.

## Outputs

- **Audio Out**: The width-processed stereo audio output.

## Controls

- **Width**: Adjusts stereo field expansion (0.0 to 4.0, default 1.0). At 0.0, the signal is summed to mono; at 1.0, original stereo width is maintained; above 1.0, stereo width is artificially widened.
- **Mix**: Dry/Wet mix slider (0.0 to 1.0, default 1.0) controlling the ratio of dry unprocessed signal to wet widened signal.
