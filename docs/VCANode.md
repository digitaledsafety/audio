# VCA Node

The VCA (Voltage-Controlled Amplifier) Node is used to control the amplitude of an audio signal. It features high-precision modulation, phase inversion, and absolute silencing via a dedicated mute stage.

## Inputs

*   **Audio In**: The audio signal to be amplified.
*   **Gain CV**: A Control Voltage input to modulate the gain stage.
*   **Mute CV**: A Control Voltage input to modulate the mute stage. This can be used for secondary amplitude control or remote muting.
*   **Gate In**: A Gate input that controls the output. When no gate is connected or the gate is High, the node operates normally. When a Low gate signal is received, the node is muted.

## Outputs

*   **Audio Out**: The amplified audio signal.

## Controls

*   **Gain**: Sets the base gain level (0 to 10).
*   **Invert Phase**: When enabled, inverts the phase of the output signal.
*   **Mute**: Manually mutes the output, overriding all other settings.
*   **Slew (s)**: Adjusts the smoothing time (0.001s to 1s) for transitions in Gain, Mute, and Gate states. This prevents audible clicks and allows for smooth ramping.
