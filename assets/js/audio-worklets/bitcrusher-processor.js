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
        this.lastSamples = []; // For sample rate reduction: holds the last processed sample per channel
        this.phases = [];      // For sample rate reduction: accumulator for timing per channel
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]; // Get the first input
        const output = outputs[0]; // Get the first output

        if (!input || input.length === 0) return true;

        // Get parameter values
        const bitsParam = parameters.bits;
        const srReductionParam = parameters.sampleRateReduction;

        const isBitsConstant = bitsParam.length === 1;
        const isSrConstant = srReductionParam.length === 1;

        let step = isBitsConstant ? Math.pow(0.5, bitsParam[0]) : 0;
        let srReduction = isSrConstant ? srReductionParam[0] : 1;

        const numChannels = input.length;

        // Maintain per-channel state
        while (this.lastSamples.length < numChannels) {
            this.lastSamples.push(0);
            this.phases.push(0);
        }

        // Process each channel
        for (let channel = 0; channel < numChannels; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];
            const channelLength = inputChannel.length;

            let lastSample = this.lastSamples[channel];
            let phase = this.phases[channel];

            for (let i = 0; i < channelLength; ++i) {
                let currentSample = inputChannel[i];

                if (!isBitsConstant) {
                    step = Math.pow(0.5, bitsParam[i]);
                }

                if (!isSrConstant) {
                    srReduction = srReductionParam[i];
                }

                // --- Bit Depth Reduction ---
                if (step > 0) {
                    currentSample = Math.floor(currentSample / step) * step;
                }

                // --- Sample Rate Reduction (simple hold method) ---
                phase += 1 / (srReduction || 1);
                if (phase >= 1) {
                    phase -= 1; // Reset phase
                    lastSample = currentSample; // Store the new "processed" sample
                }
                outputChannel[i] = lastSample;
            }

            this.lastSamples[channel] = lastSample;
            this.phases[channel] = phase;
        }

        return true; // Indicate that the processor is still active
    }
}

// Register the processor with a unique name
registerProcessor('bitcrusher-processor', BitcrusherProcessor);
