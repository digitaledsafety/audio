# Turing Machine Node (`TuringMachineNode`)

A random looping shift register for generating semi-random musical melodies and stepped control voltages.

## Inputs
* **Clock In**: Trigger input to step the internal shift register.
* **Prob CV**: Voltage control input to modulate mutation probability.

## Outputs
* **CV Out**: Stepped control voltage output scaled between 0V and 5V.
* **Gate Out**: Gate trigger output active on selected step patterns.

## Controls
* **Prob**: Probability slider (0.0 to 1.0) controlling bit mutation rate.
* **Steps**: Register length slider (2 to 32 steps).

## Description
The Turing Machine creates evolving rhythmic and melodic loops. When **Prob** is at 0%, the sequence loops deterministically. Increasing **Prob** introduces random bit flips, causing the sequence to gradually mutate over time.
