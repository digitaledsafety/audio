const fs = require('fs');
const path = require('path');

function generateMarkdown(meta) {
    let md = `# ${meta.title} Node\n\n`;
    md += `**Category:** \`${meta.category}\`  \n`;
    md += `**Class:** \`${meta.className || ''}\` \n\n`;
    md += `${meta.description}\n\n`;

    // Inputs
    md += `## Inputs\n\n`;
    if (meta.inputs && meta.inputs.length > 0) {
        md += `| Socket Name | Socket Type | Description |\n`;
        md += `| :--- | :--- | :--- |\n`;
        meta.inputs.forEach(input => {
            md += `| **${input.label || input.name}** | \`${input.socket || 'voltage'}\` | ${input.description} |\n`;
        });
    } else {
        md += `*This node has no inputs.*\n`;
    }
    md += `\n`;

    // Outputs
    md += `## Outputs\n\n`;
    if (meta.outputs && meta.outputs.length > 0) {
        md += `| Socket Name | Socket Type | Description |\n`;
        md += `| :--- | :--- | :--- |\n`;
        meta.outputs.forEach(output => {
            md += `| **${output.label || output.name}** | \`${output.socket || 'voltage'}\` | ${output.description} |\n`;
        });
    } else {
        md += `*This node has no outputs.*\n`;
    }
    md += `\n`;

    // Controls
    md += `## Controls & Parameters\n\n`;
    if (meta.controls && meta.controls.length > 0) {
        md += `| Control | Type | Range / Options | Default | Description |\n`;
        md += `| :--- | :--- | :--- | :--- | :--- |\n`;
        meta.controls.forEach(ctrl => {
            let range = '-';
            if (ctrl.type === 'slider') {
                range = `\`${ctrl.min}\` to \`${ctrl.max}\` (step: \`${ctrl.step}\`)`;
            } else if (ctrl.type === 'select' && ctrl.options) {
                range = ctrl.options.map(o => `\`${o}\``).join(', ');
            } else if (ctrl.type === 'checkbox') {
                range = '`true` / `false`';
            } else if (ctrl.type === 'button') {
                range = 'Toggle / Momentary';
            } else if (ctrl.type === 'text') {
                range = 'Text String';
            }
            const defVal = ctrl.default !== undefined ? `\`${ctrl.default}\`` : '-';
            md += `| **${ctrl.label}** | \`${ctrl.type}\` | ${range} | ${defVal} | ${ctrl.description} |\n`;
        });
    } else {
        md += `*This node has no interactive UI controls.*\n`;
    }
    md += `\n`;

    // Gotchas / Code Nuances
    if (meta.gotchas && meta.gotchas.length > 0) {
        md += `## Code Details & Nuances\n\n`;
        meta.gotchas.forEach(gotcha => {
            md += `* ${gotcha}\n`;
        });
        md += `\n`;
    }

    return md;
}

function runDocGenerator() {
    const htmlPath = path.join(__dirname, '../_layouts/default.html');
    const docsDir = path.join(__dirname, '../docs');

    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const classNames = [
        "ManualGateNode", "MicrophoneInputNode", "ToneGeneratorNode", "NoiseGeneratorNode", "MediaPlayerNode",
        "DTSEnhancerNode", "VectorPannerNode", "StereoWidenerNode", "ChordGeneratorNode", "VCANode",
        "VisualizerNode", "BernoulliGateNode", "ProbabilityNode", "LogicGatesNode", "ClockDividerNode",
        "SignalInverterNode", "TuringMachineNode", "SampleAndHoldNode", "RandomVoltageNode", "MixerNode",
        "MasterGainOutputNode", "FilterNode", "DelayNode", "PingPongDelayNode", "ChorusNode",
        "PhaserNode", "FlangerNode", "ArpeggiatorNode", "SequencerNode", "DrumMachineNode",
        "MasterClockNode", "StereoPannerNode", "DistortionNode", "CompressorNode", "ReverbNode",
        "LFONode", "EnvelopeFollowerNode", "ADSREnvelopeNode", "BitcrusherNode", "VocoderNode",
        "AttenuverterNode", "QuantizerNode", "GranularSynthesizerNode"
    ];

    let generatedCount = 0;

    classNames.forEach(className => {
        const reg = new RegExp(`class\\s+${className}[^{]*\\{[\\s\\S]*?static\\s+metadata\\s*=\\s*(\\{[\\s\\S]*?\\n\\s*\\});`);
        const match = html.match(reg);
        if (match) {
            try {
                const meta = eval("(" + match[1] + ")");
                meta.className = className;
                const markdownContent = generateMarkdown(meta);

                const filenames = new Set([meta.filename]);
                // Add className.md as an alias if different
                if (className && className !== meta.filename.replace('.md', '')) {
                    filenames.add(`${className}.md`);
                }

                filenames.forEach(fname => {
                    const targetFilePath = path.join(docsDir, fname);
                    fs.writeFileSync(targetFilePath, markdownContent, 'utf8');
                    generatedCount++;
                    console.log(`[Generated] ${fname} (${meta.title} Node)`);
                });
            } catch (err) {
                console.error(`Failed to generate doc for ${className}:`, err);
            }
        } else {
            console.warn(`No static metadata found for class ${className}`);
        }
    });

    console.log(`\nDoc generation completed! Generated/updated ${generatedCount} doc files.`);
}

if (require.main === module) {
    runDocGenerator();
}

module.exports = { generateMarkdown, runDocGenerator };
