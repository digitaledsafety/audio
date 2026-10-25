# Wavefolder Node

The Wavefolder Node applies non-linear wavefolding harmonic synthesis and drive to an input signal. Unlike traditional clipping distortion which flattens peak voltages, wavefolding folds peak signals back inward when they exceed threshold limits, generating bright, complex harmonic overtones from simple source waveforms.

## Inputs

* **Audio In**: The audio input signal to be folded.
* **Fold CV**: Control Voltage input modulating fold drive and intensity in real time.

## Outputs

* **Audio Out**: The processed wavefolded audio output signal.

## Controls

* **Folds**: Sets the number of folding folds/stages applied to the signal (1.0 to 10.0).
* **Drive**: Controls the input gain drive feeding into the folding stage (0.1x to 5.0x).
* **Mix**: Blends between dry untreated signal (0.0) and wet wavefolded signal (1.0).

## Technical Details

The Wavefolder utilizes an anti-aliased continuous trigonometric wavefolding transfer function $f(x) = \tanh(\sin(\text{folds} \cdot \pi \cdot x) \cdot (1 + 0.2 \cdot \text{folds}))$ with $4\times$ oversampling on the Web Audio API `WaveShaperNode` to eliminate aliasing artifacts across high pitch registers.
