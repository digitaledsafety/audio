# Random Voltage Node (`RandomVoltageNode`)

Generates stepped or smooth random control voltages on clock triggers or continuously.

## Inputs
* **Trigger In**: Clock trigger input for stepped random generation.

## Outputs
* **CV Out**: Random voltage output.

## Controls
* **Range Min**: Minimum output voltage bound (-5.0V to 5.0V).
* **Range Max**: Maximum output voltage bound (-5.0V to 5.0V).
* **Slew**: Slew rate slider (0.0 to 1.0s) to smooth voltage transitions.

## Description
Generates unpredictable control voltages bounded by **Range Min** and **Range Max**. The **Slew** control smooths step transitions into continuous random motion.
