# Bernoulli Gate Node (`BernoulliGateNode`)

Stochastically routes incoming clock or gate triggers to one of two output paths (Output A or Output B) based on a configurable probability.

## Inputs
* **Gate In**: Incoming clock tick or gate trigger.
* **Probability CV**: Voltage control input to dynamically modulate the probability value.

## Outputs
* **Out A**: Output trigger path A.
* **Out B**: Output trigger path B.

## Controls
* **Probability**: Slider (0.0 to 1.0) controlling the probability that an incoming trigger is routed to Output A vs. Output B.

## Description
The Bernoulli Gate acts as a probabilistic switch. Each time a trigger is received on **Gate In**, a random test is conducted against the configured probability threshold. If the roll is less than or equal to the probability setting, the trigger fires on **Out A**; otherwise, it fires on **Out B**.
