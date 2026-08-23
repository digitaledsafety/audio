# Sample & Hold Node

The **Sample & Hold Node** samples an incoming voltage signal whenever a clock pulse or trigger is received, holding that constant voltage output until the next clock trigger arrives.

## Inputs

- **Signal In**: Incoming signal or noise source to sample.
- **Clock**: Trigger input that commands the node to take a new voltage sample.

## Outputs

- **Out**: Stepped voltage output holding the sampled voltage value.

## Controls

The Sample & Hold node operates automatically on clock triggers and does not require manual parameter controls.
