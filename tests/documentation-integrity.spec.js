const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Documentation Integrity', () => {
  test('should verify every registered node class has a corresponding documentation file in docs/', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('#cta-button');
    if (await cta.isVisible()) {
      await cta.click();
    }

    // Retrieve unique class names from window.NodeRegistry._nodes
    const classNames = await page.evaluate(() => {
      if (!window.NodeRegistry || !window.NodeRegistry._nodes) return [];
      const names = new Set();
      for (const ctor of window.NodeRegistry._nodes.values()) {
        if (ctor && ctor.name) {
          names.add(ctor.name);
        }
      }
      return Array.from(names);
    });

    expect(classNames.length).toBeGreaterThan(0);

    const docsDir = path.join(__dirname, '..', 'docs');
    const docFiles = fs.readdirSync(docsDir);

    const mapping = {
      'ToneGeneratorNode': ['VCONode.md'],
      'NoiseGeneratorNode': ['NoiseSourceNode.md'],
      'MediaPlayerNode': ['MediaPlayerNode.md'],
      'ChordGeneratorNode': ['ChordGeneratorNode.md'],
      'VCANode': ['VCANode.md'],
      'MasterGainOutputNode': ['OutputNode.md'],
      'FilterNode': ['VCFNode.md'],
      'DelayNode': ['DelayNode.md'],
      'PingPongDelayNode': ['DelayNode.md', 'PingPongDelayNode.md'],
      'ChorusNode': ['ChorusNode.md'],
      'PhaserNode': ['PhaserNode.md'],
      'FlangerNode': ['FlangerNode.md'],
      'DistortionNode': ['DistortionNode.md'],
      'CompressorNode': ['CompressorNode.md'],
      'ReverbNode': ['ReverbNode.md'],
      'ArpeggiatorNode': ['ArpeggiatorNode.md'],
      'LFONode': ['LFONode.md'],
      'ADSREnvelopeNode': ['EGNode.md'],
      'EnvelopeFollowerNode': ['EnvelopeFollowerNode.md'],
      'BitcrusherNode': ['BitcrusherNode.md'],
      'SequencerNode': ['SequencerNode.md'],
      'AttenuverterNode': ['AttenuverterNode.md'],
      'MasterClockNode': ['ClockNode.md'],
      'VocoderNode': ['VocoderNode.md'],
      'MicrophoneInputNode': ['MicrophoneInputNode.md'],
      'GranularSynthesizerNode': ['GranularSynthesizerNode.md'],
      'ManualGateNode': ['GateNode.md'],
      'QuantizerNode': ['quantizer-node.md', 'QuantizerNode.md'],
      'DrumMachineNode': ['drum-machine-node.md', 'DrumMachineNode.md'],
      'MixerNode': ['MixerNode.md', 'mixing-signals.md'],
      'VisualizerNode': ['VisualizerNode.md'],
      'StereoPannerNode': ['StereoPannerNode.md'],
      'DTSEnhancerNode': ['DTSEnhancerNode.md'],
      'VectorPannerNode': ['VectorPannerNode.md'],
      'StereoWidenerNode': ['StereoWidenerNode.md'],
      'BernoulliGateNode': ['BernoulliGateNode.md'],
      'ProbabilityNode': ['ProbabilityNode.md'],
      'LogicGatesNode': ['LogicGatesNode.md'],
      'TuringMachineNode': ['TuringMachineNode.md'],
      'SampleAndHoldNode': ['SampleAndHoldNode.md'],
      'RandomVoltageNode': ['RandomVoltageNode.md'],
      'ClockDividerNode': ['ClockDividerNode.md'],
      'SignalInverterNode': ['SignalInverterNode.md'],
      'ScaleArpeggiatorNode': ['ScaleArpeggiatorNode.md']
    };

    for (const className of classNames) {
      if (['WebAudioNode', 'GeneratorNode', 'ModulatorNode'].includes(className)) continue;
      const expectedFiles = mapping[className] || [`${className}.md`];
      const found = expectedFiles.some(f => docFiles.includes(f));
      expect(found, `Documentation file missing for class ${className}. Expected one of: ${expectedFiles.join(', ')}`).toBe(true);
    }
  });
});
