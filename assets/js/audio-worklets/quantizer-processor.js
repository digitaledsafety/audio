class QuantizerProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            { name: 'rootNote', defaultValue: 60, minValue: 0, maxValue: 127 },
        ];
    }

    constructor() {
        super();
        this.scaleIntervals = [0, 2, 4, 5, 7, 9, 11]; // Default to Major scale
        this.port.onmessage = (event) => {
            if (event.data.scale) {
                this.scaleIntervals = event.data.scale;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        if (!input || input.length === 0 || !output || output.length === 0) {
            return true; // No input/output to process
        }

        const rootNote = parameters.rootNote ? parameters.rootNote[0] : 60;
        const numChannels = Math.min(input.length, output.length);

        for (let channel = 0; channel < numChannels; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];
            if (!inputChannel || !outputChannel) continue;

            const channelLength = inputChannel.length;

            for (let i = 0; i < channelLength; i++) {
                const voltage = inputChannel[i];

                // 1. Convert incoming voltage to a total number of semitones from C-1 (MIDI 0)
                const totalSemitonesFromC = voltage * 12;

                // 2. Calculate the base MIDI note for the current root note, treating C4 (60) as the central point.
                const rootNoteMidi = rootNote;

                // 3. Determine the target semitone based on the scale intervals relative to the root note.
                const octaveOffset = Math.floor((totalSemitonesFromC - rootNoteMidi) / 12);
                const semitoneInOctave = ((totalSemitonesFromC - rootNoteMidi) % 12 + 12) % 12;

                let closestInterval = this.scaleIntervals[0] || 0;
                let minDistance = Infinity;

                if (Array.isArray(this.scaleIntervals) && this.scaleIntervals.length > 0) {
                    for (const interval of this.scaleIntervals) {
                        const distance = Math.abs(semitoneInOctave - interval);
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestInterval = interval;
                        }
                    }

                    // Also check if the note is closer to the next octave's root note.
                    const distanceToNextOctaveRoot = Math.abs(semitoneInOctave - 12);
                    if (distanceToNextOctaveRoot < minDistance) {
                        closestInterval = 12;
                    }
                }

                // 4. Calculate the final MIDI note and convert back to voltage.
                const finalMidiNote = rootNoteMidi + (octaveOffset * 12) + closestInterval;
                const outputVoltage = finalMidiNote / 12.0;

                outputChannel[i] = outputVoltage;
            }
        }

        // If there are additional output channels not present in input, mirror channel 0 if available
        if (output.length > input.length && input[0]) {
            for (let channel = input.length; channel < output.length; ++channel) {
                const outputChannel = output[channel];
                const sourceChannel = output[0];
                if (outputChannel && sourceChannel) {
                    outputChannel.set(sourceChannel);
                }
            }
        }

        return true;
    }
}

registerProcessor('quantizer-processor', QuantizerProcessor);
