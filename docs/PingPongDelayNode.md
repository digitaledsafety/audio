# Ping Pong Delay Node

The **Ping Pong Delay Node** creates a stereo spatial delay effect where echoes alternate between the left and right audio channels.

## Inputs

- **Audio In**: The incoming audio signal to be processed with stereo alternating delay.
- **Delay CV**: Optional control voltage input to dynamically modulate the delay time.

## Outputs

- **Audio Out**: The processed stereo ping pong delay output signal.

## Controls

- **Delay Time (s)**: Sets the delay time in seconds between left and right channel bounces (0.01s to 2.0s).
- **Feedback**: Controls the number of delay repetitions by feeding the delayed output back into the delay lines (0.0 to 0.95).
- **Mix**: Balances the dry input signal with the wet ping pong delay output (0.0 to 1.0).
