// assets/js/audio-worklets/granular-processor.js

class GranularProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'grainSize', defaultValue: 0.1, minValue: 0.01, maxValue: 0.5 },
      { name: 'grainDensity', defaultValue: 20, minValue: 1, maxValue: 100 },
      { name: 'pitchShift', defaultValue: 0, minValue: -2400, maxValue: 2400 }, // in cents
      { name: 'positionJitter', defaultValue: 0, minValue: 0, maxValue: 1 }
    ];
  }

  constructor(options) {
    super(options);
    this.buffer = new Float32Array(sampleRate * 2); // 2-second buffer
    this.writeIndex = 0;
    this.grainScheduler = {
      nextGrainTime: 0,
    };
    this.activeGrains = [];

    // Precalculate sine window lookup table to eliminate Math.sin calls in sample loops
    this.windowTableSize = 1024;
    this.windowTable = new Float32Array(this.windowTableSize);
    for (let k = 0; k < this.windowTableSize; k++) {
      this.windowTable[k] = Math.sin(Math.PI * (k / (this.windowTableSize - 1)));
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!output || !output[0] || output[0].length === 0) {
      return true;
    }

    const inputChannel = input ? input[0] : null;

    if (inputChannel && inputChannel.length > 0) {
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.writeIndex] = inputChannel[i];
        this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
      }
    }

    const grainSize = parameters.grainSize[0] * sampleRate;
    const grainDensity = parameters.grainDensity[0];
    const pitchShift = parameters.pitchShift[0];
    const positionJitter = parameters.positionJitter[0];

    // Simple scheduling
    this.grainScheduler.nextGrainTime -= output[0].length / sampleRate;
    if (this.grainScheduler.nextGrainTime <= 0) {
        this.grainScheduler.nextGrainTime = 1.0 / grainDensity;

        const grain = {
            startPosition: (this.writeIndex - grainSize - (Math.random() * positionJitter * this.buffer.length)) % this.buffer.length,
            playbackPosition: 0,
            size: grainSize,
            pitch: 1.0 * Math.pow(2, pitchShift / 1200),
        };
        if(grain.startPosition < 0) grain.startPosition += this.buffer.length;

        this.activeGrains.push(grain);
    }

    for (const channel of output) {
      channel.fill(0);
    }

    const outputLength = output[0].length;
    const numChannels = output.length;
    const tableMaxIndex = this.windowTableSize - 1;

    for (let i = this.activeGrains.length - 1; i >= 0; i--) {
        const grain = this.activeGrains[i];

        for (let j = 0; j < outputLength; j++) {
            if (grain.playbackPosition >= grain.size) break;

            const bufferIndex = Math.floor(grain.startPosition + grain.playbackPosition);

            // Basic linear interpolation for pitch shifting
            const index1 = bufferIndex % this.buffer.length;
            const index2 = (bufferIndex + 1) % this.buffer.length;
            const fraction = grain.startPosition + grain.playbackPosition - bufferIndex;
            const sample = (this.buffer[index1] * (1 - fraction)) + (this.buffer[index2] * fraction);

            // Lookup window from precomputed sine table
            const normalizedPos = grain.playbackPosition / grain.size;
            const tableIdx = Math.min(tableMaxIndex, Math.max(0, (normalizedPos * tableMaxIndex) | 0));
            const windowVal = this.windowTable[tableIdx];
            const windowedSample = sample * windowVal;

            for (let c = 0; c < numChannels; c++) {
                output[c][j] += windowedSample;
            }

            grain.playbackPosition += grain.pitch;
        }

        if (grain.playbackPosition >= grain.size) {
            this.activeGrains.splice(i, 1);
        }
    }


    return true;
  }
}

registerProcessor('granular-processor', GranularProcessor);
