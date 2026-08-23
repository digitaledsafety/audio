# Vector Panner Node

The **Vector Panner Node** provides 2D spatial positioning of audio using HRTF (Head-Related Transfer Function) spatial audio modeling. It allows positioning sound sources across left/right (X axis) and front/back (Y/Z depth plane) spatial dimensions with CV control.

## Inputs

- **Audio In**: The audio signal to be spatially positioned.
- **X CV**: Control voltage input to modulate the horizontal X position (Left / Right).
- **Y CV**: Control voltage input to modulate the depth Y position (Front / Back).

## Outputs

- **Audio Out**: The spatially panned audio signal output.

## Controls

- **X (Left/Right)**: Horizontal position control (-5 to +5, default 0). Negative values position the sound to the left; positive values position it to the right.
- **Y (Front/Back)**: Depth position control (-5 to +5, default 0). Maps to spatial depth distance relative to the listener.
