// bitcrusher-processor.js
// This file will be loaded by the AudioContext's audioWorklet.addModule()

class BitcrusherProcessor extends AudioWorkletProcessor {
    // Define custom parameters that can be controlled from the main thread
    static get parameterDescriptors() {
        return [
            {
                name: 'bits',
                defaultValue: 8,
                minValue: 1,
                maxValue: 16,
                automationRate: 'a-rate' // 'a-rate' for audio-rate changes (smoother)
            },
            {
                name: 'sampleRateReduction', // Factor by which to reduce sample rate (e.g., 2 means half sample rate)
                defaultValue: 1,
                minValue: 1,
                maxValue: 100, // Or whatever max reduction you want
                automationRate: 'a-rate'
            }
        ];
    }

    constructor() {
        super();
        this.lastSample = []; // Per-channel array for sample rate reduction
        this.phase = [];      // Per-channel array for phase accumulators
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]; // Get the first input
        const output = outputs[0]; // Get the first output

        if (!input || input.length === 0 || !output || output.length === 0) {
            return true;
        }

        // Get the parameter values (they are arrays, even if constant, check first element)
        const bits = parameters.bits[0];
        const sampleRateReduction = parameters.sampleRateReduction[0];

        // Process each channel independently to prevent cross-channel phase or sample corruption
        for (let channel = 0; channel < input.length; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];
            if (!inputChannel || !outputChannel) continue;

            if (this.lastSample[channel] === undefined) {
                this.lastSample[channel] = 0;
                this.phase[channel] = 0;
            }

            for (let i = 0; i < inputChannel.length; ++i) {
                let currentSample = inputChannel[i];

                // --- Bit Depth Reduction ---
                const step = Math.pow(0.5, bits);
                currentSample = Math.floor(currentSample / step) * step;

                // --- Sample Rate Reduction (simple hold method per channel) ---
                this.phase[channel] += 1 / sampleRateReduction;
                if (this.phase[channel] >= 1) {
                    this.phase[channel] %= 1;
                    this.lastSample[channel] = currentSample;
                }
                outputChannel[i] = this.lastSample[channel];
            }
        }

        // Pass through output for additional channels if output has more channels than input
        for (let channel = input.length; channel < output.length; ++channel) {
            if (output[channel] && output[0]) {
                output[channel].set(output[0]);
            }
        }

        return true; // Indicate that the processor is still active
    }
}

// Register the processor with a unique name
registerProcessor('bitcrusher-processor', BitcrusherProcessor);
