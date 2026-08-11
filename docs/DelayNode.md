# Delay Node

The Delay Node can be used to delay an audio signal.

## Inputs

*   **Audio In**: The audio input to the node.
*   **Delay CV**: A CV input to control the delay time.

## Outputs

*   **Audio Out**: The audio output of the node.

## Controls

*   **Delay Time (s)**: The delay time in seconds.
*   **Feedback**: The amount of feedback in the delay loop (0 to 0.95).
*   **Mix**: The dry/wet mix of the delay effect (0 to 1).

## Automatic Feedback Mix Clamping
When the Delay Node is connected in a feedback cycle (either routed directly into itself or via a loop with other nodes), the engine automatically clamps its internal **Mix** control to `1.0` (100% wet). This prevents the raw (dry) input signal from bleeding directly into the output, ensuring only the looping feedback signal is heard. The Mix slider on the UI is visually greyed out while the loop is active, and restores to its original value when the loop is disconnected.
