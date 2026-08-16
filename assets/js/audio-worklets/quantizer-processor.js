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
        const rootNote = parameters.rootNote[0];

        if (!input || input.length === 0 || !input[0] || input[0].length === 0 || !output || output.length === 0) {
            return true; // No input to process
        }

        const inputChannel = input[0];
        const outputChannel = output[0];

        for (let i = 0; i < inputChannel.length; i++) {
            const voltage = inputChannel[i];

            // 1. Convert incoming voltage to a total number of semitones from C-1 (MIDI 0)
            const totalSemitonesFromC = voltage * 12;

            // 2. Base MIDI note for the current root note
            const rootNoteMidi = rootNote;

            // 3. Determine target semitone using non-negative modulo for negative pitch offsets
            const semitoneOffset = totalSemitonesFromC - rootNoteMidi;
            const octaveOffset = Math.floor(semitoneOffset / 12);
            const semitoneInOctave = ((semitoneOffset % 12) + 12) % 12;

            let closestInterval = this.scaleIntervals[0];
            let minDistance = Infinity;

            for (const interval of this.scaleIntervals) {
                const distance = Math.abs(semitoneInOctave - interval);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestInterval = interval;
                }
            }

            // Check if closer to next octave root
            const distanceToNextOctaveRoot = Math.abs(semitoneInOctave - 12);
            if (distanceToNextOctaveRoot < minDistance) {
                closestInterval = 12;
            }

            // 4. Calculate final MIDI note and convert back to 1V/oct voltage
            const finalMidiNote = rootNoteMidi + (octaveOffset * 12) + closestInterval;
            outputChannel[i] = finalMidiNote / 12.0;
        }

        // Copy outputChannel to any secondary output channels for stereo / multi-channel CV routing
        for (let channel = 1; channel < output.length; channel++) {
            if (output[channel]) {
                output[channel].set(outputChannel);
            }
        }

        return true;
    }
}

registerProcessor('quantizer-processor', QuantizerProcessor);
