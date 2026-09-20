const fs = require('fs');
const path = require('path');
const { generateMarkdown } = require('./generate-docs');

function checkDocs() {
    const htmlPath = path.join(__dirname, '../_layouts/default.html');
    const docsDir = path.join(__dirname, '../docs');
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

    const errors = [];

    classNames.forEach(className => {
        const reg = new RegExp(`class\\s+${className}[^{]*\\{[\\s\\S]*?static\\s+metadata\\s*=\\s*(\\{[\\s\\S]*?\\n\\s*\\});`);
        const match = html.match(reg);
        if (!match) {
            errors.push(`Missing static metadata on class ${className} in _layouts/default.html.`);
            return;
        }

        let meta;
        try {
            meta = eval("(" + match[1] + ")");
            meta.className = className;
        } catch (e) {
            errors.push(`Failed to parse static metadata for class ${className}: ${e.message}`);
            return;
        }

        const requiredKeys = ['title', 'category', 'description', 'filename', 'inputs', 'outputs', 'controls', 'gotchas'];
        requiredKeys.forEach(key => {
            if (meta[key] === undefined) {
                errors.push(`Class ${className} static metadata missing required field '${key}'.`);
            }
        });

        const docFilePath = path.join(docsDir, meta.filename);
        if (!fs.existsSync(docFilePath)) {
            errors.push(`Documentation file '${meta.filename}' for class ${className} does not exist in docs/.`);
        } else {
            const existingContent = fs.readFileSync(docFilePath, 'utf8').replace(/\r\n/g, '\n').trim();
            const expectedContent = generateMarkdown(meta).replace(/\r\n/g, '\n').trim();
            if (existingContent !== expectedContent) {
                errors.push(`Documentation file '${meta.filename}' for ${className} is out of sync with code metadata. Run 'npm run generate-docs' to update.`);
            }
        }
    });

    if (errors.length > 0) {
        const msg = `Documentation Integrity Check Failed:\n${errors.map(err => ` - ${err}`).join('\n')}`;
        if (require.main === module) {
            console.error(msg);
            process.exit(1);
        } else {
            throw new Error(msg);
        }
    } else {
        console.log(`Documentation Integrity Check Passed! All ${classNames.length} node classes are fully documented and in sync with code.`);
    }
}

if (require.main === module) {
    checkDocs();
}

module.exports = { checkDocs };
