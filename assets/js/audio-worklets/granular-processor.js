// assets/js/audio-worklets/granular-processor.js

const SINE_TABLE_SIZE = 1024;
const SINE_TABLE = new Float32Array(SINE_TABLE_SIZE);
for (let i = 0; i < SINE_TABLE_SIZE; i++) {
    SINE_TABLE[i] = Math.sin(Math.PI * (i / (SINE_TABLE_SIZE - 1)));
}

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
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (!output || output.length === 0) return true;

    const inputChannel = input ? input[0] : null;
    const numChannels = output.length;
    const blockLen = output[0].length;
    const bufferLen = this.buffer.length;

    if (inputChannel && inputChannel.length > 0) {
      const inLen = inputChannel.length;
      for (let i = 0; i < inLen; i++) {
        this.buffer[this.writeIndex] = inputChannel[i];
        this.writeIndex = (this.writeIndex + 1) % bufferLen;
      }
    }

    const grainSize = parameters.grainSize[0] * sampleRate;
    const grainDensity = parameters.grainDensity[0];
    const pitchShift = parameters.pitchShift[0];
    const positionJitter = parameters.positionJitter[0];

    // Simple scheduling
    this.grainScheduler.nextGrainTime -= blockLen / sampleRate;
    if (this.grainScheduler.nextGrainTime <= 0) {
        this.grainScheduler.nextGrainTime = 1.0 / grainDensity;

        const grain = {
            startPosition: (this.writeIndex - grainSize - (Math.random() * positionJitter * bufferLen)) % bufferLen,
            playbackPosition: 0,
            size: grainSize,
            pitch: 1.0 * Math.pow(2, pitchShift / 1200),
        };
        if (grain.startPosition < 0) grain.startPosition += bufferLen;

        this.activeGrains.push(grain);
    }

    for (let c = 0; c < numChannels; c++) {
      output[c].fill(0);
    }

    for (let i = this.activeGrains.length - 1; i >= 0; i--) {
        const grain = this.activeGrains[i];

        for (let j = 0; j < blockLen; j++) {
            const bufferIndex = Math.floor(grain.startPosition + grain.playbackPosition);

            // Basic linear interpolation for pitch shifting
            const index1 = bufferIndex % bufferLen;
            const index2 = (bufferIndex + 1) % bufferLen;
            const fraction = grain.startPosition + grain.playbackPosition - bufferIndex;
            const sample = (this.buffer[index1] * (1 - fraction)) + (this.buffer[index2] * fraction);

            // Apply a simple window using lookup table to avoid transcendental calls in loop
            const normPos = grain.playbackPosition / grain.size;
            const tableIdx = normPos >= 1.0 ? SINE_TABLE_SIZE - 1 : (normPos <= 0.0 ? 0 : (normPos * (SINE_TABLE_SIZE - 1)) | 0);
            const window = SINE_TABLE[tableIdx];

            for (let c = 0; c < numChannels; c++) {
                output[c][j] += sample * window;
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
