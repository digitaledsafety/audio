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
    this.lastSample = []; // Per-channel array for last processed sample
    this.phase = [];      // Per-channel array for accumulator timing
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]; // Get the first input
    const output = outputs[0]; // Get the first output

    if (!input || input.length === 0) return true;

    // Get parameter values (taking first value for current block)
    const bits = parameters.bits ? parameters.bits[0] : 8;
    const sampleRateReduction = parameters.sampleRateReduction ? parameters.sampleRateReduction[0] : 1;

    // Process each channel independently to avoid phase/sample crosstalk
    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      if (!outputChannel) continue;

      if (this.lastSample[channel] === undefined) {
        this.lastSample[channel] = 0;
        this.phase[channel] = 0;
      }

      let lastSample = this.lastSample[channel];
      let phase = this.phase[channel];

      for (let i = 0; i < inputChannel.length; ++i) {
        let currentSample = inputChannel[i];

        // --- Bit Depth Reduction ---
        // Calculate the step size for quantization
        const step = Math.pow(0.5, bits);
        // Quantize the sample
        currentSample = Math.floor(currentSample / step) * step;

        // --- Sample Rate Reduction (hold method) ---
        phase += 1 / sampleRateReduction;
        if (phase >= 1) {
          phase %= 1;
          lastSample = currentSample;
        }
        outputChannel[i] = lastSample;
      }

      this.lastSample[channel] = lastSample;
      this.phase[channel] = phase;
    }

    return true; // Indicate that the processor is still active
  }
}

// Register the processor with a unique name
registerProcessor('bitcrusher-processor', BitcrusherProcessor);
