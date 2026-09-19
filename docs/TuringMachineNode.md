# Turing Machine Node

The **Turing Machine Node** is a shift-register based random looping sequencer that produces evolving melodies and rhythmic trigger patterns.

## Inputs

- **Clock**: Clock trigger pulse input to advance the internal shift register.
- **Prob CV**: Optional control voltage input modulating bit mutation probability.

## Outputs

- **CV Out**: Stepped pitch/control voltage generated from shift-register bits.
- **Trigger Out**: Rhythmic trigger pulse generated from bit pattern matches.

## Controls

- **Evolution Prob**: Mutation probability rate (0.0 locked repeating loop, 0.5 balanced evolution, 1.0 completely random sequence, default 0.0).
- **Steps**: Shift-register loop length sequence count (2 to 16 steps, default 16).
