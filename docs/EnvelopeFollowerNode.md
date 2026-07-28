# Envelope Follower Node

The **Envelope Follower** node analyzes the amplitude (volume) of an incoming audio signal and generates a corresponding control voltage (CV) signal that tracks its volume envelope. This CV signal can then be used to modulate parameters of other nodes (such as a filter's cutoff frequency or a VCA's gain), enabling effects like auto-wah, sidechain-like compression, and dynamic modulation.

## Inputs

| Name       | Description                              |
| ---------- | ---------------------------------------- |
| **Audio In** | The incoming audio signal whose volume envelope is analyzed. |

## Outputs

| Name       | Description                              |
| ---------- | ---------------------------------------- |
| **CV Out**  | The generated control voltage signal representing the tracked volume envelope. |

## Controls

| Name            | Description                                |
| --------------- | ------------------------------------------ |
| **Sensitivity** | Controls the input gain/scaling factor. Higher sensitivity values produce a larger range and higher peak value for the output CV signal. |
| **Attack (s)**  | Controls the rise/attack response time of the envelope tracker in seconds (0.001s to 1.0s). Shorter attack times track rapid increases in volume more quickly. |
| **Release (s)** | Controls the fall/release response time of the envelope tracker in seconds (0.001s to 1.0s). Longer release times smooth out rapid drops in volume, keeping the CV high for longer. |
