const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Documentation Integrity', () => {
  test('every registered Rete node class should have a corresponding documentation markdown file', async ({ page }) => {
    await page.goto('/');
    await page.click('#cta-button');

    // Get all registered Rete node class names from window.NodeRegistry
    const nodeClassNames = await page.evaluate(() => {
      if (!window.NodeRegistry || !window.NodeRegistry._nodes) return [];
      const constructors = Array.from(window.NodeRegistry._nodes.values());
      const classNames = new Set(constructors.map(c => c.name));
      return Array.from(classNames);
    });

    expect(nodeClassNames.length).toBeGreaterThan(0);

    const docsDir = path.join(__dirname, '..', 'docs');
    const docFiles = fs.readdirSync(docsDir).map(f => f.toLowerCase());

    const missingDocs = [];

    const aliasMap = {
      'ToneGeneratorNode': 'vconode.md',
      'NoiseGeneratorNode': 'noisesourcenode.md',
      'MasterGainOutputNode': 'outputnode.md',
      'FilterNode': 'vcfnode.md',
      'ADSREnvelopeNode': 'egnode.md',
      'MasterClockNode': 'clocknode.md',
      'ManualGateNode': 'gatenode.md',
      'MixerNode': 'mixing-signals.md'
    };

    for (const className of nodeClassNames) {
      if (className === 'CompositeNode' || className === 'SubCircuitInputNode' || className === 'SubCircuitOutputNode') {
        continue;
      }

      const directName = `${className.toLowerCase()}.md`;
      const kebabName = `${className.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}.md`;
      const aliasName = aliasMap[className];

      const matchFound = docFiles.includes(directName) ||
                         docFiles.includes(kebabName) ||
                         (aliasName && docFiles.includes(aliasName));

      if (!matchFound) {
        missingDocs.push(className);
      }
    }

    expect(missingDocs).toEqual([]);
  });
});
