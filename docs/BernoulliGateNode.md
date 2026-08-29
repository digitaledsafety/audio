# Bernoulli Gate Node

The **Bernoulli Gate Node** is a stochastic coin-toss module that routes incoming clock or gate pulses to either Output A or Output B based on a configurable probability parameter.

## Inputs

- **Clock/Gate**: Incoming clock trigger or gate pulse.

## Outputs

- **Out A**: Output path A, activated when the random check falls below (1 - Probability).
- **Out B**: Output path B, activated when the random check passes the Probability threshold.

## Controls

- **Probability (B)**: Sets the probability (0.0 to 1.0, default 0.5) that an incoming pulse routes to Output B instead of Output A.
