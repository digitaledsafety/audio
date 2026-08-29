# Turing Machine Node

The **Turing Machine Node** is a shift-register based random looping sequencer module that generates pseudorandom CV and trigger patterns.

## Inputs

- **Clock**: Incoming clock pulses that advance the internal 16-bit shift register.
- **Prob CV**: Optional control voltage input to dynamically modulate the randomness probability.

## Outputs

- **CV Out**: Quantized control voltage output generated from the shift register value (0.0V to 5.0V).
- **Trigger Out**: Trigger pulse output generated when specific bit conditions in the register are met.

## Controls

- **Probability**: Sets the likelihood (0.0 to 1.0) that bits in the shift register will flip on each clock step. At 0.0, the pattern loops indefinitely; at 1.0, the sequence is completely random.
- **Steps**: Sets the active length of the looping shift register sequence (2 to 16 steps).
