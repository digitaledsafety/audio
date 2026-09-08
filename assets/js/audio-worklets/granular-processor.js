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

    const rawGrainSize = (parameters.grainSize && parameters.grainSize.length > 0) ? parameters.grainSize[0] : 0.1;
    const rawGrainDensity = (parameters.grainDensity && parameters.grainDensity.length > 0) ? parameters.grainDensity[0] : 20;
    const rawPitchShift = (parameters.pitchShift && parameters.pitchShift.length > 0) ? parameters.pitchShift[0] : 0;
    const rawPositionJitter = (parameters.positionJitter && parameters.positionJitter.length > 0) ? parameters.positionJitter[0] : 0;

    const grainSize = Math.max(0.01, Math.min(0.5, isNaN(rawGrainSize) ? 0.1 : rawGrainSize)) * sampleRate;
    const grainDensity = Math.max(1, Math.min(100, isNaN(rawGrainDensity) ? 20 : rawGrainDensity));
    const pitchShift = isNaN(rawPitchShift) ? 0 : rawPitchShift;
    const positionJitter = Math.max(0, Math.min(1, isNaN(rawPositionJitter) ? 0 : rawPositionJitter));

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

    for (let i = this.activeGrains.length - 1; i >= 0; i--) {
        const grain = this.activeGrains[i];

        for (let j = 0; j < output[0].length; j++) {
            const rawIndex = grain.startPosition + grain.playbackPosition;
            const bufferIndex = Math.floor(rawIndex);

            // Basic linear interpolation with non-negative modulo for safe buffer access
            const len = this.buffer.length;
            const index1 = ((bufferIndex % len) + len) % len;
            const index2 = (((bufferIndex + 1) % len) + len) % len;
            const fraction = rawIndex - bufferIndex;
            const s1 = this.buffer[index1] || 0;
            const s2 = this.buffer[index2] || 0;
            const sample = (s1 * (1 - fraction)) + (s2 * fraction);

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
