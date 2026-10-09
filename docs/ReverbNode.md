# Reverb Node

The Reverb Node applies high-fidelity acoustic convolution reverb to an audio signal.

## Inputs

*   **Audio In**: The main audio input socket (supports multiple incoming audio connections).
*   **Mix CV**: Control voltage input for real-time modulation of the Wet/Dry mix balance via external CV sources (such as LFOs or envelopes).

## Outputs

*   **Audio Out**: The processed audio output carrying the blended dry signal and spatial convolution tail.

## Controls

*   **Duration (s)**: Adjusts the impulse response duration / room decay length (0.1s to 10s, default: 2s).
*   **Decay**: Adjusts the exponential dampening rate of the impulse response (0.1 to 10, default: 2).
*   **Mix**: Controls the Wet/Dry crossfade ratio (0.0 = 100% Dry, 1.0 = 100% Wet).

## Architecture & Performance

To prevent CPU overhead when using multiple Reverb nodes in complex projects, `ReverbNode` instances utilize a **Shared Convolver Pool Engine**. Under the hood:
* Each `ReverbNode` maintains its own independent inline Dry/Wet mix and CV controls for its specific audio chain.
* Active convolver buffers with matching duration and decay settings share background Web Audio `ConvolverNode` instances, eliminating FFT processing duplication while preserving complete modular patching flexibility.
