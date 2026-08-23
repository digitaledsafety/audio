# Bernoulli Gate Node

The **Bernoulli Gate Node** is a stochastic coin-toss routing module. Upon receiving an incoming clock trigger or gate pulse, it probabilistically routes the signal to either Output A or Output B based on a configurable probability threshold.

## Inputs

- **Clock/Gate**: Incoming trigger pulse or gate voltage signal.

## Outputs

- **Out A**: First output path, triggered when the internal coin toss falls below the probability threshold (complementary path).
- **Out B**: Second output path, triggered when the internal coin toss falls within the probability threshold.

## Controls

- **Probability (B)**: Sets the probability (0.0 to 1.0, default 0.5) that an incoming pulse or gate is routed to Output B. At 0.0, 100% of triggers go to Out A; at 1.0, 100% go to Out B; at 0.5, triggers are split randomly 50/50.
