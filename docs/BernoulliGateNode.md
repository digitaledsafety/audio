# Bernoulli Gate Node

The **Bernoulli Gate Node** is a stochastic routing module that directs incoming trigger, gate, or clock pulses to one of two outputs (**Out A** or **Out B**) based on a configurable probability threshold.

## Inputs

- **Clock/Gate**: Incoming trigger, gate, or clock pulse signal.

## Outputs

- **Out A**: Output terminal triggered when the random check fails (probability condition for B is not met).
- **Out B**: Output terminal triggered when the random check succeeds (probability condition for B is met).

## Controls

- **Probability (B)**: Sets the probability threshold (from 0.0 to 1.0, default 0.5) for routing incoming pulses to **Out B**. At 0.0 (0%), all pulses route exclusively to **Out A**. At 1.0 (100%), all pulses route to **Out B**.
