# Turing Machine Node

The **Turing Machine Node** is a shift-register random looping sequencer based on Music Thing Modular's Turing Machine. On each clock pulse, it steps through a binary shift register to produce repeating or evolving control voltage patterns and trigger pulses.

## Inputs

- **Clock**: Clock input pulse that advances the internal shift register.
- **Prob CV**: Control voltage input to dynamically modulate the bit-flip probability threshold.

## Outputs

- **CV Out**: Stepped control voltage output scaled from the internal shift register bit state.
- **Trigger Out**: Gate/trigger pulse output fired when specific bits in the shift register are active.

## Controls

- **Evolution Prob**: Controls the probability (0.0 to 1.0) of bit-flipping during shift register iterations. At 0.0 (0%), the pattern loops continuously without changing. At 1.0 (100%), every bit is inverted, creating evolving or pseudo-random sequences.
- **Steps**: Length of the looping shift register sequence (2 to 16 steps, default 16).
