# Turing Machine Node

The **Turing Machine Node** is a random shift register generator based on classic modular shift-register designs. It generates looping CV melodies and trigger patterns that gradually evolve over time based on a probability threshold.

## Inputs

- **Clock**: Incoming clock trigger input to step the internal shift register.
- **Prob CV**: Optional CV input to modulate shift register coin-toss mutation probability.

## Outputs

- **CV**: Quantized control voltage output (0.0 V to 1.0 V range) derived from the internal register bits.
- **Trigger**: Gate trigger output that fires when the register's current step condition is active.

## Controls

- **Probability**: Sets the bit-flip mutation chance (0.0 to 1.0, default 0.5). At 0.5, the pattern is completely random. At 0.0 or 1.0, the current 8/16-step sequence locks into a repeating loop.
- **Steps**: Configures internal shift register length (2 to 16 steps, default 16).
