# Random Voltage Node

The **Random Voltage Node** generates stepped or smoothed random control voltages upon receiving clock trigger pulses.

## Inputs

- **Clock**: Trigger pulse input that prompts generation of a new random voltage level.

## Outputs

- **Out**: The generated random CV output signal.

## Controls

- **Slew**: Adjusts output voltage smoothing/slew rate (0.001s for sharp stepped changes to 1.0s for smooth gliding random curves).
