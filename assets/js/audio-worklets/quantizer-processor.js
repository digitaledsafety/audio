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

        if (!input || input.length === 0 || input[0].length === 0) {
            return true; // No input to process
        }

        // We'll take the first value as the current value for this block.
        const rootNoteMidi = parameters.rootNote[0];
        const inputChannel = input[0];
        const outputChannel = output[0];
        const scaleIntervals = this.scaleIntervals;
        const scaleLen = scaleIntervals.length;
        const inputLen = inputChannel.length;

        for (let i = 0; i < inputLen; i++) {
            const voltage = inputChannel[i];

            // 1. Convert incoming voltage to a total number of semitones from C-1 (MIDI 0)
            const totalSemitonesFromC = voltage * 12;

            // 2. Treat C4 (60) as the central point.
            const delta = totalSemitonesFromC - rootNoteMidi;

            // 3. Determine the target semitone based on the scale intervals relative to the root note.
            const octaveOffset = Math.floor(delta / 12);
            const semitoneInOctave = delta % 12;

            let closestInterval = scaleIntervals[0];
            let minDistance = Math.abs(semitoneInOctave - closestInterval);

            for (let j = 1; j < scaleLen; j++) {
                const interval = scaleIntervals[j];
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

        return true;
    }
}

registerProcessor('quantizer-processor', QuantizerProcessor);
