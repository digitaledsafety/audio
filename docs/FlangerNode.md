# Flanger Node

The **Flanger Node** produces a comb-filtering "jet plane" sweep effect by modulating a short delay time (1ms-10ms) fed back into itself.

## Inputs

- **Audio In**: The incoming audio signal to be flanged.
- **Rate CV**: Optional control voltage input to dynamically modulate the LFO rate.

## Outputs

- **Audio Out**: The processed flanger audio output signal.

## Controls

- **Rate (Hz)**: Sets the speed of the flanging LFO modulation (0.05 Hz to 5.0 Hz).
- **Depth**: Sets the magnitude of delay time modulation (0.0 to 1.0).
- **Feedback**: Controls the amount of delayed signal fed back into the flanger delay line (0.0 to 0.95).
- **Mix**: Balances the dry input signal with the wet flanged effect (0.0 to 1.0).
