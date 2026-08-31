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

    // Precompute sine window lookup table (1024 points) per performance guidelines
    this.tableSize = 1024;
    this.sineWindowTable = new Float32Array(this.tableSize);
    for (let i = 0; i < this.tableSize; i++) {
      this.sineWindowTable[i] = Math.sin(Math.PI * (i / (this.tableSize - 1)));
    }
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const inputChannel = input ? input[0] : null;

    if (inputChannel && inputChannel.length > 0) {
      const inLen = inputChannel.length;
      const bufLen = this.buffer.length;
      for (let i = 0; i < inLen; i++) {
        this.buffer[this.writeIndex] = inputChannel[i];
        this.writeIndex = (this.writeIndex + 1) % bufLen;
      }
    }

    if (!output || output.length === 0) return true;

    const blockSize = output[0].length;
    const numChannels = output.length;
    const bufLen = this.buffer.length;

    const grainSize = parameters.grainSize[0] * sampleRate;
    const grainDensity = parameters.grainDensity[0];
    const pitchShift = parameters.pitchShift[0];
    const positionJitter = parameters.positionJitter[0];

    // Simple scheduling
    this.grainScheduler.nextGrainTime -= blockSize / sampleRate;
    if (this.grainScheduler.nextGrainTime <= 0) {
        this.grainScheduler.nextGrainTime = 1.0 / grainDensity;

        const grain = {
            startPosition: (this.writeIndex - grainSize - (Math.random() * positionJitter * bufLen)) % bufLen,
            playbackPosition: 0,
            size: grainSize,
            pitch: 1.0 * Math.pow(2, pitchShift / 1200),
        };
        if (grain.startPosition < 0) grain.startPosition += bufLen;

        this.activeGrains.push(grain);
    }

    for (let c = 0; c < numChannels; c++) {
      output[c].fill(0);
    }

    const tableSize = this.tableSize;
    const sineWindowTable = this.sineWindowTable;

    for (let i = this.activeGrains.length - 1; i >= 0; i--) {
        const grain = this.activeGrains[i];

        for (let j = 0; j < blockSize; j++) {
            const bufferIndex = Math.floor(grain.startPosition + grain.playbackPosition);

            // Basic linear interpolation for pitch shifting
            const index1 = bufferIndex % bufLen;
            const index2 = (bufferIndex + 1) % bufLen;
            const fraction = grain.startPosition + grain.playbackPosition - bufferIndex;
            const sample = (this.buffer[index1] * (1 - fraction)) + (this.buffer[index2] * fraction);

            // Sine window lookup table substitution
            const normPos = grain.playbackPosition / grain.size;
            const tableIdx = Math.min(tableSize - 1, Math.max(0, Math.floor(normPos * (tableSize - 1))));
            const window = sineWindowTable[tableIdx];

            const scaledSample = sample * window;
            for (let c = 0; c < numChannels; c++) {
                output[c][j] += scaledSample;
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
