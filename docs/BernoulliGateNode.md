# Bernoulli Gate Node

The **Bernoulli Gate Node** is a stochastic gate router that routes incoming trigger pulses or gate signals to one of two outputs (Out A or Out B) based on a configurable probability threshold.

## Inputs

- **Clock/Gate**: The incoming clock pulse or gate signal to be probabilistically routed.

## Outputs

- **Out A**: Output jack receiving the pulse when the random probability test evaluates false (relative to B probability).
- **Out B**: Output jack receiving the pulse when the random probability test evaluates true (relative to B probability).

## Controls

- **Probability (B)**: Sets the probability (from 0.0 to 1.0, default 0.5) that an incoming pulse is routed to Out B instead of Out A. At 0.0, 100% of signals go to Out A; at 1.0, 100% of signals go to Out B.
