# Phaser Node

The **Phaser Node** creates sweeping phase-cancellation notches in the frequency spectrum using a cascade of all-pass filters modulated by an LFO.

## Inputs

- **Audio In**: The incoming audio signal to be phase-modulated.
- **Rate CV**: Optional control voltage input to dynamically modulate the LFO rate.

## Outputs

- **Audio Out**: The processed phaser output audio signal.

## Controls

- **Rate (Hz)**: Sets the speed of the phase modulation sweep (0.1 Hz to 10.0 Hz).
- **Depth**: Sets the frequency range of the all-pass filter sweep (0.0 to 1.0).
- **Feedback**: Feeds the phase-shifted signal back into the filter network to create sharper notch peaks (0.0 to 0.9).
- **Mix**: Balances the dry input signal with the wet phaser effect (0.0 to 1.0).
