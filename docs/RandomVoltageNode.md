# Random Voltage Node

The **Random Voltage Node** generates stepped or smoothed random control voltage (CV) values on each incoming clock tick.

## Inputs

- **Clock**: Clock input pulse that triggers the generation of a new random CV voltage level.

## Outputs

- **CV Out**: Generated random control voltage output signal.

## Controls

- **Smoothness**: Controls the interpolation smoothing between successive random voltage levels (0.0 for instant stepped values up to 1.0 for continuous portamento/slewed voltage transitions, default 0.0).
