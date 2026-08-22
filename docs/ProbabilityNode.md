# Probability Node

The **Probability Node** is a stochastic control module that randomly filters incoming clock pulses and gate voltage signals based on a configurable probability threshold. It enables generative rhythm variations, humanized timing, and non-deterministic event triggering in modular patches.

## Inputs

- **Clock/Gate**: The input clock event or gate voltage signal to be probabilistically filtered.
- **Prob CV**: Optional control voltage (CV) input to modulate the probability threshold dynamically (additive to the manual probability slider).

## Outputs

- **Out**: The filtered clock pulse or gate signal. Signals pass through to this output only when a random check succeeds against the current probability threshold.

## Controls

- **Probability**: Sets the probability threshold (from 0.0 to 1.0, default 0.5) that an incoming pulse or gate signal will pass through to the output. At 0.0 (0%), all signals are muted/filtered; at 1.0 (100%), all signals pass through without filtering.
