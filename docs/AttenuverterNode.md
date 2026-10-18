# Attenuverter Node

The Attenuverter Node is a utility for scaling, inverting, and adding DC offset to Control Voltage (CV) or audio signals. It can make a modulation signal stronger or weaker (attenuate), flip its polarity (invert), and apply a constant DC voltage offset. When no input signal is patched, it acts as a manual DC voltage source.

## Inputs

*   **In**: The CV or audio signal to be processed (optional).

## Outputs

*   **Out**: The processed signal (attenuated/inverted input + DC offset).

## Controls

*   **Level**: A bipolar control (-1.0 to 1.0, default `1.0`) that sets the amount of attenuation or inversion.
    *   A value of `1.0` passes the signal through unchanged.
    *   Values between `0.0` and `1.0` reduce the signal's amplitude.
    *   A value of `0.0` completely silences the incoming signal.
    *   Negative values invert the signal's polarity (e.g., `-1.0` passes the signal at original amplitude but inverted).
*   **Offset**: A bipolar control (-1.0 to 1.0, default `0.0`) that adds a constant DC voltage bias to the output. When **In** is unpatched, this generates a manual static CV level.
