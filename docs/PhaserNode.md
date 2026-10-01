# Phaser Node (`PhaserNode`)

Multi-stage all-pass phase modulation filter effect.

## Inputs
* **Audio In**: Input audio signal.
* **Rate CV**: Control voltage for LFO rate.

## Outputs
* **Audio Out**: Stereo phaser audio output.

## Controls
* **Rate**: Modulation speed in Hz (0.1 to 10.0 Hz).
* **Depth**: Phase sweep depth slider (0.0 to 1.0).
* **Feedback**: Phase notch feedback slider (0.0 to 0.95).
* **Mix**: Dry/wet mix ratio (0.0 to 1.0).

## Description
Sweeps notches across the frequency spectrum using cascaded all-pass filters.
