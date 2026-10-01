# Clock Divider Node (`ClockDividerNode`)

Divides incoming clock triggers into rhythmic sub-divisions (/2, /4, /8, /16) to drive multi-rate sequencers and modulation nodes.

## Inputs
* **Clock In**: Master clock tick or gate input.

## Outputs
* **/2**: Clock output triggering once every 2 input ticks.
* **/4**: Clock output triggering once every 4 input ticks.
* **/8**: Clock output triggering once every 8 input ticks.
* **/16**: Clock output triggering once every 16 input ticks.

## Controls
* None (fixed division ratios /2, /4, /8, /16).

## Description
The Clock Divider takes a steady clock signal and emits divided clock pulses at lower rhythmic rates, enabling polyrhythmic patterns and synced sequence triggers.
