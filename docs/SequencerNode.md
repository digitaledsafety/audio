# Sequencer Node

The Sequencer Node can be used to create musical sequences.

## Inputs

| Name             | Description                              |
| ---------------- | ---------------------------------------- |
| **Clock In**     | A CV input that accepts a clock signal to drive the sequencer's timing externally. |
| **Transpose CV** | Modulates the root note of the sequence. Follows the 1V/Octave standard (+1V = +12 semitones). |

## Outputs

| Name       | Description                              |
| ---------- | ---------------------------------------- |
| **Audio**  | The audio output of the sequencer's internal synthesizer. |
| **MIDI Out** | Outputs the MIDI notes being played by the sequencer. |

## Controls

| Name                     | Description                                                                    |
| ------------------------ | ------------------------------------------------------------------------------ |
| **BPM**                  | The tempo of the sequencer in beats per minute.                                |
| **Note Duration**        | The duration of each note in the sequence.                                     |
| **Sequence**             | The musical sequence string to play (space-separated note names or `~` for rests). |
| **Randomize Settings**   | Toggle button to show or hide the algorithmic note sequence generation controls. |
| **Random Mode**          | Mode for pitch quantization during sequence generation (`Chord` or `Scale`).   |
| **Chord Type**           | Harmonic chord interval selection when in `Chord` mode.                        |
| **Scale Type**           | Scale/mode selection when in `Scale` mode (e.g., Major, Minor, Dorian, Pentatonic, Blues). |
| **Root Note**            | Base root pitch for generating notes (e.g. `C4`, `G3`).                         |
| **Octave Spread**        | Number of additional octaves across which notes can be distributed (0-3).      |
| **Sequence Length**      | Target step length for generated sequence (4 to 64 steps, default 32).          |
| **Gen Pattern**          | Melodic generation algorithm (see details below).                               |
| **🎲**                    | Regenerates a new sequence using the current settings.                          |
| **Waveform**             | The waveform of the oscillator. Can be one of `sine`, `square`, `sawtooth`, or `triangle`. |
| **Envelope**             | A button to show/hide the ADSR envelope controls for the internal synthesizer. |
| **Attack (s)**           | The attack time of the envelope in seconds.                                    |
| **Decay (s)**            | The decay time of the envelope in seconds.                                     |
| **Sustain**              | The sustain level of the envelope (0-1).                                       |
| **Release (s)**          | The release time of the envelope in seconds.                                   |

## Algorithmic Melodic Generation Patterns

When randomizing sequences, the Sequencer supports several generation algorithms (`Gen Pattern`):

- **Scalar Walk**: Generates stepwise melodic movement along scale or chord degrees (mostly ±1 step, with occasional small leaps and occasional rests), producing vocal and natural melodies.
- **Motif Generator**: Builds a short 4- or 8-step musical motif and repeats it across the full sequence length with subtle variations (20% chance of stepwise note shifts on repetitions).
- **Pentatonic Groove**: Rhythmically structured generator prioritizing root/chord tones on downbeats and syncopated rests on off-beats.
- **Up / Down / Up-Down / Down-Up**: Arpeggiator-like directional sequences repeating up to the configured sequence length.
- **Random**: Uniform random selection across available notes with rests.
