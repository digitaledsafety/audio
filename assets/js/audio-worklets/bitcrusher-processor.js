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
        this.lastSamples = [0, 0]; // Per-channel state to prevent cross-channel contamination
        this.phases = [0, 0];      // Per-channel timing phase accumulator
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0]; // Get the first input
        const output = outputs[0]; // Get the first output

        if (!input || input.length === 0) {
            return true;
        }

        const bitsParam = parameters.bits;
        const srParam = parameters.sampleRateReduction;

        const numChannels = input.length;
        while (this.lastSamples.length < numChannels) {
            this.lastSamples.push(0);
            this.phases.push(0);
        }

        const isBitsConstant = bitsParam.length === 1;
        const isSrConstant = srParam.length === 1;

        for (let channel = 0; channel < numChannels; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];
            if (!outputChannel) continue;

            let lastSample = this.lastSamples[channel];
            let phase = this.phases[channel];

            const len = inputChannel.length;
            let step = isBitsConstant ? Math.pow(0.5, bitsParam[0]) : 0;
            let srRed = isSrConstant ? srParam[0] : 1;
            let phaseStep = isSrConstant ? (srRed > 0 ? 1 / srRed : 1) : 0;

            for (let i = 0; i < len; ++i) {
                let currentSample = inputChannel[i];

                if (!isBitsConstant) {
                    const b = bitsParam[i];
                    step = Math.pow(0.5, b);
                }

                if (step > 0) {
                    currentSample = Math.floor(currentSample / step) * step;
                }

                if (!isSrConstant) {
                    srRed = srParam[i];
                    phaseStep = srRed > 0 ? 1 / srRed : 1;
                }

                phase += phaseStep;
                if (phase >= 1) {
                    phase -= 1;
                    lastSample = currentSample;
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
