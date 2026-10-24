# LFO Node

The LFO Node generates low-frequency oscillation signals for pitch, filter, or parameter modulation, and serves as a rhythmic timing source.

## Inputs

*   **Sync In**: Clock/gate input socket for external synchronization.

## Outputs

*   **CV Out**: Control voltage output signal for modulation or clock synchronization.

## Controls

*   **Rate Mode**: Selects the rate unit (`Hz` or `BPM`).
*   **BPM**: Sets the beats per minute when Rate Mode is set to `BPM`.
*   **Division**: Selects the musical beat division (`1`, `1/2`, `1/4`, `1/8`, `1/16`, `1/32`) when Rate Mode is `BPM` or when synchronized via `Sync In`.
*   **Frequency (Hz)**: Sets the oscillator frequency in Hertz when Rate Mode is `Hz`.
*   **Fine Rate (Hz)**: Fine-tunes the oscillator rate offset in 0.01 Hz resolution.
*   **Waveform**: Selects the LFO waveform shape (`sine`, `square`, `sawtooth`, or `triangle`).
*   **Amount**: Adjusts the peak modulation amplitude of the output signal.
*   **Offset**: Adjusts the constant DC voltage offset added to the output signal.
