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
    const input = inputs[0]; // Get the first input (assuming single input)
    const output = outputs[0]; // Get the first output (assuming single output)

    if (!input || input.length === 0) return true;

    // Get the parameter values
    const bits = parameters.bits[0];
    const sampleRateReduction = parameters.sampleRateReduction[0];
    const step = Math.pow(0.5, bits);

    // Ensure state arrays match input channel count
    while (this.lastSamples.length < input.length) {
      this.lastSamples.push(0);
      this.phases.push(0);
    }

    // Process each channel
    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      if (!outputChannel) continue;

      let lastSample = this.lastSamples[channel];
      let phase = this.phases[channel];

      for (let i = 0; i < inputChannel.length; ++i) {
        let currentSample = inputChannel[i];

        // --- Bit Depth Reduction ---
        // Quantize the sample
        currentSample = Math.floor(currentSample / step) * step;

        // --- Sample Rate Reduction (simple hold method) ---
        // Increment phase by the reduction factor. When it hits 1, process a new sample.
        phase += 1 / sampleRateReduction;
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
