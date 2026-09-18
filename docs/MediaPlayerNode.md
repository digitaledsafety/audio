# Media Player Node

The Media Player Node is a versatile audio source node that streams and plays standard web media audio file formats, including WAV, MP3, OGG, FLAC, and WebM.

## Inputs

*   **Gate In**: High voltage (+1V or higher) triggers audio playback from the beginning.

## Outputs

*   **Audio**: The processed audio output signal of the media file.

## Controls

*   **Audio URL**: The URL of the web audio media file to load and play.
*   **Play**: Triggers audio playback from the start.
*   **Stop**: Stops active audio playback.
*   **Gain**: Adjusts overall output volume (0.0 to 2.0).
*   **Speed**: Adjusts the playback speed (0.1x to 4.0x speed multiplier).
*   **Pitch (st)**: Transposes pitch in semitones (-12 to +12 semitones).
*   **Reverse**: Reverses buffer playback direction.
*   **Loop**: Toggles continuous playback looping.
