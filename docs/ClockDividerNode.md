# Clock Divider Node

The **Clock Divider Node** accepts a primary clock pulse input and generates rhythmic sub-division triggers at integer division ratios, providing synchronized clock sources for sequencers, arpeggiators, and envelopes.

## Inputs

- **Clock In**: Incoming clock pulse or gate signal.

## Outputs

- **/2**: Outputs a clock trigger every 2 incoming clock pulses (1/2 speed).
- **/4**: Outputs a clock trigger every 4 incoming clock pulses (1/4 speed).
- **/8**: Outputs a clock trigger every 8 incoming clock pulses (1/8 speed).
- **/16**: Outputs a clock trigger every 16 incoming clock pulses (1/16 speed).

## Controls

The Clock Divider Node operates automatically on incoming pulses and does not require manual control parameters.
