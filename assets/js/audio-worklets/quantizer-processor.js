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

        if (!input || input.length === 0 || !input[0] || input[0].length === 0) {
            return true; // No input to process
        }

        const inputChannel = input[0];
        const outputChannel = output[0];
        const len = inputChannel.length;
        const scaleIntervals = this.scaleIntervals;
        const numIntervals = scaleIntervals.length;

        for (let i = 0; i < len; i++) {
            const voltage = inputChannel[i];

            // 1. Convert incoming voltage to total semitones
            const totalSemitonesFromC = voltage * 12;
            const diff = totalSemitonesFromC - rootNote;

            // 2. Determine target semitone using non-negative modulo for octave wrap
            const octaveOffset = Math.floor(diff / 12);
            const semitoneInOctave = ((diff % 12) + 12) % 12;

            let closestInterval = scaleIntervals[0];
            let minDistance = Math.abs(semitoneInOctave - closestInterval);

            for (let k = 1; k < numIntervals; k++) {
                const interval = scaleIntervals[k];
                const distance = Math.abs(semitoneInOctave - interval);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestInterval = interval;
                }
            }

            // Also check distance to next octave root (12)
            const distanceToNextOctaveRoot = Math.abs(semitoneInOctave - 12);
            if (distanceToNextOctaveRoot < minDistance) {
                closestInterval = 12;
            }

            // 3. Calculate final MIDI note and convert back to 1V/Oct voltage
            const finalMidiNote = rootNote + (octaveOffset * 12) + closestInterval;
            outputChannel[i] = finalMidiNote / 12.0;
        }

        return true;
    }
}

registerProcessor('quantizer-processor', QuantizerProcessor);
