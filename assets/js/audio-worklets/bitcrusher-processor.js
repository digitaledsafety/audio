// bitcrusher-processor.js
// AudioWorklet processor for bit depth and sample rate reduction

class BitcrusherProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [
            {
                name: 'bits',
                defaultValue: 8,
                minValue: 1,
                maxValue: 16,
                automationRate: 'a-rate'
            },
            {
                name: 'sampleRateReduction',
                defaultValue: 1,
                minValue: 1,
                maxValue: 100,
                automationRate: 'a-rate'
            }
        ];
    }

    constructor() {
        super();
        this.lastSamples = new Float32Array(2); // Support stereo state
        this.phases = new Float32Array(2);
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        if (!input || input.length === 0) return true;

        const bits = parameters.bits[0];
        const sampleRateReduction = parameters.sampleRateReduction[0];

        // Hoist loop-invariant step calculation outside sample processing loop
        const step = Math.pow(0.5, bits);
        const invStep = 1 / step;
        const phaseIncrement = 1 / sampleRateReduction;

        const numChannels = input.length;

        // Ensure state arrays accommodate current channel count
        if (this.lastSamples.length < numChannels) {
            this.lastSamples = new Float32Array(numChannels);
            this.phases = new Float32Array(numChannels);
        }

        for (let channel = 0; channel < numChannels; ++channel) {
            const inputChannel = input[channel];
            const outputChannel = output[channel];
            const channelLen = inputChannel.length;

            let lastSample = this.lastSamples[channel];
            let phase = this.phases[channel];

            for (let i = 0; i < channelLen; ++i) {
                let currentSample = inputChannel[i];

                // --- Bit Depth Reduction ---
                currentSample = Math.floor(currentSample * invStep) * step;

                // --- Sample Rate Reduction (zero-order hold) ---
                phase += phaseIncrement;
                if (phase >= 1) {
                    phase -= 1;
                    lastSample = currentSample;
                }
                outputChannel[i] = lastSample;
            }

            this.lastSamples[channel] = lastSample;
            this.phases[channel] = phase;
        }

        return true;
    }
}

registerProcessor('bitcrusher-processor', BitcrusherProcessor);
