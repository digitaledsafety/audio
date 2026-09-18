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
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const inputChannel = input[0];

    if (inputChannel && inputChannel.length > 0) {
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.writeIndex] = inputChannel[i];
        this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
      }
    }

    const grainSizeParam = (parameters.grainSize && !isNaN(parameters.grainSize[0])) ? parameters.grainSize[0] : 0.1;
    const grainDensityParam = (parameters.grainDensity && !isNaN(parameters.grainDensity[0])) ? parameters.grainDensity[0] : 20;
    const pitchShiftParam = (parameters.pitchShift && !isNaN(parameters.pitchShift[0])) ? parameters.pitchShift[0] : 0;
    const positionJitterParam = (parameters.positionJitter && !isNaN(parameters.positionJitter[0])) ? parameters.positionJitter[0] : 0;

    const grainSize = Math.max(0.01 * sampleRate, grainSizeParam * sampleRate);
    const grainDensity = Math.max(1, grainDensityParam);
    const pitchShift = pitchShiftParam;
    const positionJitter = Math.max(0, Math.min(1, positionJitterParam));

    // Simple scheduling
    const blockSize = output[0] ? output[0].length : 128;
    this.grainScheduler.nextGrainTime -= blockSize / sampleRate;
    if (this.grainScheduler.nextGrainTime <= 0) {
        this.grainScheduler.nextGrainTime = 1.0 / grainDensity;

        let startPos = Math.floor((this.writeIndex - grainSize - (Math.random() * positionJitter * this.buffer.length)) % this.buffer.length);
        startPos = ((startPos % this.buffer.length) + this.buffer.length) % this.buffer.length;

        const grain = {
            startPosition: startPos,
            playbackPosition: 0,
            size: grainSize,
            pitch: 1.0 * Math.pow(2, pitchShift / 1200),
        };

        this.activeGrains.push(grain);
    }

    for (const channel of output) {
      channel.fill(0);
    }

    const bufLen = this.buffer.length;
    for (let i = this.activeGrains.length - 1; i >= 0; i--) {
        const grain = this.activeGrains[i];

        for (let j = 0; j < blockSize; j++) {
            const bufferIndex = Math.floor(grain.startPosition + grain.playbackPosition);

            // Basic linear interpolation for pitch shifting with non-negative modulo logic
            const index1 = ((bufferIndex % bufLen) + bufLen) % bufLen;
            const index2 = (((bufferIndex + 1) % bufLen) + bufLen) % bufLen;
            const fraction = grain.startPosition + grain.playbackPosition - bufferIndex;
            const sample = (this.buffer[index1] * (1 - fraction)) + (this.buffer[index2] * fraction);

            // Apply a simple window to avoid clicks
            const window = Math.sin(Math.PI * (grain.playbackPosition / grain.size));

            for(const channel of output) {
                channel[j] += sample * window;
            }

            grain.playbackPosition += grain.pitch;
        }

        if(grain.playbackPosition >= grain.size) {
            this.activeGrains.splice(i, 1);
        }
    }


    return true;
  }
}

registerProcessor('granular-processor', GranularProcessor);
