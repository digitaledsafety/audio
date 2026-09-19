# Clock Divider Node

The **Clock Divider Node** takes an incoming master clock or trigger stream and outputs subdivided clock pulses at fractional clock frequencies (/2, /4, /8, /16).

## Inputs

- **Clock In**: Master clock pulse or gate trigger input stream.

## Outputs

- **/2**: Emits a trigger pulse every 2 incoming clock ticks.
- **/4**: Emits a trigger pulse every 4 incoming clock ticks.
- **/8**: Emits a trigger pulse every 8 incoming clock ticks.
- **/16**: Emits a trigger pulse every 16 incoming clock ticks.

## Controls

*None (fixed clock division ratios).*
