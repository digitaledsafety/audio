const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Documentation Integrity', () => {
  test('should have a corresponding documentation markdown file for every registered WebAudioNode class', async () => {
    const htmlPath = path.join(__dirname, '..', '_layouts', 'default.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Extract all class names extending WebAudioNode, ModulatorNode, or GeneratorNode
    const classMatches = [...htmlContent.matchAll(/class\s+([A-Za-z0-9_]+Node)\s+extends/g)].map(m => m[1]);

    // Ignore base classes
    const ignoredClasses = new Set(['WebAudioNode', 'ModulatorNode', 'GeneratorNode']);
    const registeredNodeClasses = classMatches.filter(cls => !ignoredClasses.has(cls));

    const docsDir = path.join(__dirname, '..', 'docs');
    const docFiles = fs.readdirSync(docsDir).map(f => f.toLowerCase());

    // Explicit alias mapping for legacy / standard named markdown files
    const aliasMap = {
      'ToneGeneratorNode': 'VCONode.md',
      'FilterNode': 'VCFNode.md',
      'ADSREnvelopeNode': 'EGNode.md',
      'MasterGainOutputNode': 'OutputNode.md',
      'MasterClockNode': 'ClockNode.md',
      'NoiseGeneratorNode': 'NoiseSourceNode.md',
      'DrumMachineNode': 'drum-machine-node.md',
      'QuantizerNode': 'quantizer-node.md',
      'ManualGateNode': 'GateNode.md'
    };

    const missingDocs = [];

    for (const className of registeredNodeClasses) {
      const expectedDocFile = aliasMap[className] || `${className}.md`;
      const expectedLower = expectedDocFile.toLowerCase();

      if (!docFiles.includes(expectedLower)) {
        missingDocs.push({ className, expectedDocFile });
      }
    }

    expect(missingDocs, `Missing documentation files for node classes: ${JSON.stringify(missingDocs)}`).toEqual([]);
  });
});
