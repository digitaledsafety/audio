# Random Voltage Node

The **Random Voltage Node** generates random control voltages on incoming clock triggers, with optional slew/smoothness filtering to morph between stepped and continuous random CV.

## Inputs

- **Clock**: Incoming trigger pulse to trigger new random voltage values.

## Outputs

- **CV Out**: Random control voltage output.

## Controls

- **Smoothness**: Slew rate / interpolation filtering between random stepped values (0.0 stepped to 1.0 smooth continuous voltage, default 0.0).
