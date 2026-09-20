# Sample & Hold Node

The **Sample & Hold Node** samples the voltage level of an incoming audio or CV signal when a rising edge trigger pulse is received and maintains (holds) that exact voltage level until the next trigger pulse.

## Inputs

- **Signal In**: The continuous audio or control voltage signal to be sampled.
- **Trigger**: Incoming trigger or clock pulse that initiates a sampling event.

## Outputs

- **CV Out**: The held voltage level output signal.

## Controls

The Sample & Hold Node operates automatically upon receiving trigger pulses and does not require manual control sliders.
