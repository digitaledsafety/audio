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
            if (event.data && event.data.scale) {
                this.scaleIntervals = event.data.scale;
            }
        };
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];
        // In the AudioWorklet, we receive an array of values for each parameter.
        // We'll take the first value as the current value for this block.
        const rootNote = parameters.rootNote[0];

        if (!input || input.length === 0 || input[0].length === 0) {
            return true; // No input to process
        }

        const numOutputChannels = output.length;
        const channelLength = input[0].length;

        for (let ch = 0; ch < numOutputChannels; ch++) {
            const inputChannel = input[ch] || input[0];
            const outputChannel = output[ch];

            for (let i = 0; i < channelLength; i++) {
                const voltage = inputChannel[i];

                // 1. Convert incoming voltage to a total number of semitones from C-1 (MIDI 0)
                const totalSemitonesFromC = voltage * 12;

                // 2. Calculate the base MIDI note for the current root note.
                const rootNoteMidi = rootNote;

                // 3. Determine target semitone based on scale intervals relative to the root note.
                const rawOffset = totalSemitonesFromC - rootNoteMidi;
                const octaveOffset = Math.floor(rawOffset / 12);
                const semitoneInOctave = ((rawOffset % 12) + 12) % 12;

                let closestInterval = this.scaleIntervals[0];
                let minDistance = Infinity;

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

                // 4. Calculate the final MIDI note and convert back to voltage.
                const finalMidiNote = rootNoteMidi + (octaveOffset * 12) + closestInterval;
                outputChannel[i] = finalMidiNote / 12.0;
            }
        }

        return true;
    }
}

registerProcessor('quantizer-processor', QuantizerProcessor);
