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
    this.phases = [];      // For sample rate reduction: accumulators for timing per channel
}

process(inputs, outputs, parameters) {
    const input = inputs[0]; // Get the first input
    const output = outputs[0]; // Get the first output

    if (!input || input.length === 0) return true;

    // Get the parameter values
    const bits = parameters.bits[0];
    const sampleRateReduction = parameters.sampleRateReduction[0];
    const step = Math.pow(0.5, bits);
    const numChannels = input.length;

    // Process each channel independently
    for (let channel = 0; channel < numChannels; ++channel) {
        if (this.lastSamples[channel] === undefined) {
            this.lastSamples[channel] = 0;
            this.phases[channel] = 0;
        }

        const inputChannel = input[channel];
        const outputChannel = output[channel];
        if (!outputChannel) continue;

        const channelLen = inputChannel.length;
        for (let i = 0; i < channelLen; ++i) {
            let currentSample = inputChannel[i];

            // --- Bit Depth Reduction ---
            currentSample = Math.floor(currentSample / step) * step;

            // --- Sample Rate Reduction (simple hold method) ---
            this.phases[channel] += 1 / sampleRateReduction;
            if (this.phases[channel] >= 1) {
                this.phases[channel]--;
                this.lastSamples[channel] = currentSample;
            }
            outputChannel[i] = this.lastSamples[channel];
        }
    }
    return true; // Indicate that the processor is still active
}
}

// Register the processor with a unique name
registerProcessor('bitcrusher-processor', BitcrusherProcessor);
