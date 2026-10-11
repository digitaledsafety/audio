# Sample & Hold Node (`SampleAndHoldNode`)

Samples an incoming signal when triggered by a clock pulse and holds that voltage value until the next trigger.

## Inputs
* **In**: Input voltage source to sample.
* **Trigger In**: Clock or gate trigger input to capture a sample.

## Outputs
* **Out**: Held voltage level output.

## Controls
* None.

## Description
When a clock pulse arrives on **Trigger In**, the Sample & Hold node captures the instantaneous amplitude of **In** and maintains that value at **Out** until the next clock pulse.
