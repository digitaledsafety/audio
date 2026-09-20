const fs = require('fs');
const path = require('path');

const metadataMap = {
    ManualGateNode: {
        title: 'Gate',
        category: 'Modulation & Sequencing',
        description: 'Manual Gate and Trigger generator producing high (1.0) or low (0.0) control voltage signals for envelopes, sequencers, or clock inputs.',
        filename: 'GateNode.md',
        inputs: [],
        outputs: [
            { name: 'gate', label: 'Gate Out', socket: 'voltage', description: 'Outputs gate high (1.0) voltage signal when active and low (0.0) when inactive.' }
        ],
        controls: [
            { key: 'gateState', label: 'Gate / Trigger', type: 'button', default: 'off', description: 'Manual toggle or hold button to activate gate signal.' }
        ],
        gotchas: [
            'Disconnecting gate outputs restores target nodes to default High (true) gate state via VoltageConnectionStrategy.'
        ]
    },
    MicrophoneInputNode: {
        title: '🎤 Mic Input',
        category: 'Sources',
        description: 'Microphone audio stream input capturing live acoustic or vocal sound from the user media device.',
        filename: 'MicrophoneInputNode.md',
        inputs: [],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Live audio stream output.' }
        ],
        controls: [
            { key: 'gain', label: 'Gain', type: 'slider', min: 0, max: 2, step: 0.01, default: 1, description: 'Microphone input gain adjustment.' }
        ],
        gotchas: [
            'Requires user microphone permission in browser.',
            'Uses navigator.mediaDevices.getUserMedia and web audio MediaStreamAudioSourceNode.'
        ]
    },
    ToneGeneratorNode: {
        title: 'VCO',
        category: 'Sources',
        description: 'Voltage Controlled Oscillator generating fundamental audio waveforms (sine, square, sawtooth, triangle) with pitch fine-tuning and CV pitch modulation.',
        filename: 'VCONode.md',
        inputs: [
            { name: 'freq', label: 'Freq CV', socket: 'voltage', description: 'Frequency control voltage modulation input (1V/Octave standard).' },
            { name: 'midi', label: 'MIDI In', socket: 'midi', description: 'MIDI input stream for setting frequency notes.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio', socket: 'voltage', description: 'Main audio output signal.' }
        ],
        controls: [
            { key: 'frequency', label: 'Frequency (Hz)', type: 'slider', min: 20, max: 20000, step: 1, default: 440, description: 'Base oscillator frequency in Hz.' },
            { key: 'fineTune', label: 'Fine Tune (cents)', type: 'slider', min: -100, max: 100, step: 1, default: 0, description: 'Fine pitch offset in cents (+/-1 semitone).' },
            { key: 'waveform', label: 'Waveform', type: 'select', options: ['sine', 'square', 'sawtooth', 'triangle'], default: 'sine', description: 'Oscillator output waveform shape.' }
        ],
        gotchas: [
            'Incoming MIDI notes override manual frequency slider setting.',
            'Fine tuning uses 2^(cents/1200) multiplier for exact pitch offsets.'
        ]
    },
    NoiseGeneratorNode: {
        title: 'Noise Source',
        category: 'Sources',
        description: 'Multi-spectrum noise generator producing White, Pink, or Brownian noise signals for percussive synthesis or atmospheric texture.',
        filename: 'NoiseSourceNode.md',
        inputs: [],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Continuous noise signal output.' }
        ],
        controls: [
            { key: 'noiseType', label: 'Noise Type', type: 'select', options: ['white', 'pink', 'brownian'], default: 'white', description: 'Selects noise spectral density distribution.' },
            { key: 'volume', label: 'Volume', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Noise output volume level.' }
        ],
        gotchas: [
            'Pink noise filters white noise with -3dB/octave slope.',
            'Brownian noise uses -6dB/octave lowpass filtering.'
        ]
    },
    MediaPlayerNode: {
        title: 'Media Player',
        category: 'Sources',
        description: 'Multi-format sample player capable of loading external audio files (WAV, MP3, OGG, FLAC, WebM) via URL with speed, pitch, reverse, and looping controls.',
        filename: 'MediaPlayerNode.md',
        inputs: [
            { name: 'gate', label: 'Gate In', socket: 'voltage', description: 'Gate signal input to trigger or stop sample playback.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Stereo/mono decoded sample audio output.' }
        ],
        controls: [
            { key: 'url', label: 'Sample URL', type: 'text', default: '', description: 'URL of audio file.' },
            { key: 'playbackRate', label: 'Speed', type: 'slider', min: 0.1, max: 4, step: 0.01, default: 1, description: 'Playback speed multiplier.' },
            { key: 'pitch', label: 'Pitch (semitones)', type: 'slider', min: -12, max: 12, step: 1, default: 0, description: 'Pitch transposition in semitones.' },
            { key: 'reverse', label: 'Reverse', type: 'checkbox', default: false, description: 'Reverses audio buffer playback direction.' },
            { key: 'loop', label: 'Loop', type: 'checkbox', default: false, description: 'Loops audio continuously when playback ends.' },
            { key: 'gain', label: 'Gain', type: 'slider', min: 0, max: 2, step: 0.01, default: 1, description: 'Output volume gain.' }
        ],
        gotchas: [
            'Replaces legacy WavePlayerNode while maintaining full backward workspace file compatibility.',
            'Audio samples are decoded asynchronously into AudioBuffer instances.'
        ]
    },
    DTSEnhancerNode: {
        title: 'DTS Enhancer',
        category: 'Effects',
        description: 'Audio enhancement node providing spectral brightness equalization and dynamic multi-band presence processing.',
        filename: 'DTSEnhancerNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio signal.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Enhanced audio output.' }
        ],
        controls: [
            { key: 'enhancement', label: 'Enhancement', type: 'slider', min: 0, max: 100, step: 1, default: 50, description: 'Spectral brightness and stereo widening intensity.' },
            { key: 'mode', label: 'Mode', type: 'select', options: ['Music', 'Movie', 'Voice'], default: 'Music', description: 'Presets EQ profile and dynamic response.' }
        ],
        gotchas: [
            'Processes signal through custom multi-band dynamic gain and equalization filters.'
        ]
    },
    VectorPannerNode: {
        title: 'Vector Panner',
        category: 'Effects',
        description: '2D quad-panning matrix node mixing four audio input channels into a stereo output based on X/Y Cartesian coordinates.',
        filename: 'VectorPannerNode.md',
        inputs: [
            { name: 'inputA', label: 'Input A', socket: 'voltage', description: 'Audio input channel A (Top-Left).' },
            { name: 'inputB', label: 'Input B', socket: 'voltage', description: 'Audio input channel B (Top-Right).' },
            { name: 'inputC', label: 'Input C', socket: 'voltage', description: 'Audio input channel C (Bottom-Left).' },
            { name: 'inputD', label: 'Input D', socket: 'voltage', description: 'Audio input channel D (Bottom-Right).' },
            { name: 'cvX', label: 'CV X', socket: 'voltage', description: 'Control voltage modulating X position.' },
            { name: 'cvY', label: 'CV Y', socket: 'voltage', description: 'Control voltage modulating Y position.' }
        ],
        outputs: [
            { name: 'outL', label: 'Out Left', socket: 'voltage', description: 'Left channel output.' },
            { name: 'outR', label: 'Out Right', socket: 'voltage', description: 'Right channel output.' }
        ],
        controls: [
            { key: 'posX', label: 'Position X', type: 'slider', min: -1, max: 1, step: 0.01, default: 0, description: 'X coordinate positioning (-1 to +1).' },
            { key: 'posY', label: 'Position Y', type: 'slider', min: -1, max: 1, step: 0.01, default: 0, description: 'Y coordinate positioning (-1 to +1).' }
        ],
        gotchas: [
            'Uses 2D quad-panning gain matrix calculations to mix 4 input sources into stereo output.'
        ]
    },
    StereoWidenerNode: {
        title: 'Stereo Widener',
        category: 'Effects',
        description: 'Stereo width expansion effect utilizing Mid/Side (M/S) matrix signal processing to expand or narrow spatial image.',
        filename: 'StereoWidenerNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio signal.' },
            { name: 'width_cv', label: 'Width CV', socket: 'voltage', description: 'Modulates stereo width coefficient.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Broadened stereo audio output.' }
        ],
        controls: [
            { key: 'width', label: 'Width', type: 'slider', min: 0, max: 2, step: 0.01, default: 1, description: 'Stereo image width (0 = mono, 1 = normal, 2 = wide).' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 1, description: 'Dry/wet mix level.' }
        ],
        gotchas: [
            'Automatic feedback mix clamping sets mix to 1.0 when included in a cyclic feedback loop.'
        ]
    },
    ChordGeneratorNode: {
        title: 'Chord Generator',
        category: 'Sources',
        description: 'Polyphonic chord voice generator producing musical chords across multiple selectable types, glides, and oscillator waveforms.',
        filename: 'ChordGeneratorNode.md',
        inputs: [
            { name: 'root', label: 'Root CV', socket: 'voltage', description: '1V/Oct CV input modulating root pitch.' },
            { name: 'midi', label: 'MIDI In', socket: 'midi', description: 'MIDI note input stream.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Polyphonic harmonic audio output.' }
        ],
        controls: [
            { key: 'rootNote', label: 'Root Note', type: 'select', options: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], default: 'C4', description: 'Base root note pitch.' },
            { key: 'chordType', label: 'Chord Type', type: 'select', options: ['Major Triad', 'Minor Triad', 'Dominant 7th', 'Major 7th', 'Minor 7th', 'Sus2', 'Sus4', 'Diminished', 'Augmented'], default: 'Major Triad', description: 'Harmonic chord interval structure.' },
            { key: 'glide', label: 'Glide (s)', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.01, description: 'Portamento glide duration between pitch changes.' },
            { key: 'fineTune', label: 'Fine Tune (cents)', type: 'slider', min: -100, max: 100, step: 1, default: 0, description: 'Global pitch offset in cents.' },
            { key: 'waveform', label: 'Waveform', type: 'select', options: ['sine', 'square', 'sawtooth', 'triangle'], default: 'sawtooth', description: 'Oscillator voice waveform.' }
        ],
        gotchas: [
            'Uses phase-continuous AudioParam frequency updates with glide portamento to prevent audio clicks.',
            'Voices crossfade smoothly when changing chord types.'
        ]
    },
    VCANode: {
        title: 'VCA',
        category: 'Modulation & Sequencing',
        description: 'Voltage Controlled Amplifier controlling audio or control voltage amplitude via manual gain and CV modulation.',
        filename: 'VCANode.md',
        inputs: [
            { name: 'in', label: 'In', socket: 'voltage', description: 'Audio or CV input signal.' },
            { name: 'cv', label: 'CV In', socket: 'voltage', description: 'Control voltage modulating VCA gain.' }
        ],
        outputs: [
            { name: 'out', label: 'Out', socket: 'voltage', description: 'Amplified or attenuated output signal.' }
        ],
        controls: [
            { key: 'gain', label: 'Gain', type: 'slider', min: 0, max: 1, step: 0.01, default: 1, description: 'Manual base gain level.' },
            { key: 'cvAmount', label: 'CV Amount', type: 'slider', min: 0, max: 1, step: 0.01, default: 1, description: 'Depth of CV input modulation.' }
        ],
        gotchas: [
            'Operates as a linear multiplier for both audio signals and DC control voltages.'
        ]
    },
    VisualizerNode: {
        title: 'Visualizer',
        category: 'Utilities',
        description: 'Real-time oscilloscope, frequency spectrum analyzer, and vectorscope display using WebGL and Canvas API.',
        filename: 'VisualizerNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Audio or modulation signal to visualize.' }
        ],
        outputs: [],
        controls: [
            { key: 'mode', label: 'Mode', type: 'select', options: ['Oscilloscope', 'Spectrum', 'Vectorscope'], default: 'Oscilloscope', description: 'Visualization display mode.' }
        ],
        gotchas: [
            'Renders real-time waveform or FFT spectrum using WebGL / Canvas API.',
            'Can be globally disabled via Settings toggle to reduce CPU/GPU resource consumption.'
        ]
    },
    BernoulliGateNode: {
        title: 'Bernoulli Gate',
        category: 'Modulation & Sequencing',
        description: 'Probabilistic gate router that stochastically directs incoming gate pulses to Output A or Output B based on probability.',
        filename: 'BernoulliGateNode.md',
        inputs: [
            { name: 'in', label: 'Gate In', socket: 'voltage', description: 'Incoming clock or trigger pulse.' },
            { name: 'prob_cv', label: 'Prob CV', socket: 'voltage', description: 'CV modulating probability distribution.' }
        ],
        outputs: [
            { name: 'outA', label: 'Out A', socket: 'voltage', description: 'Triggered when coin toss resolves to A.' },
            { name: 'outB', label: 'Out B', socket: 'voltage', description: 'Triggered when coin toss resolves to B.' }
        ],
        controls: [
            { key: 'probability', label: 'Probability (A/B)', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Probability balance (0.0 = 100% B, 0.5 = 50/50, 1.0 = 100% A).' }
        ],
        gotchas: [
            'Stochastically routes input gate pulses to Out A or Out B based on weighted probability.'
        ]
    },
    ProbabilityNode: {
        title: 'Probability',
        category: 'Modulation & Sequencing',
        description: 'Stochastic gate filter that allows gate pulses to pass through based on a configurable probability percentage.',
        filename: 'ProbabilityNode.md',
        inputs: [
            { name: 'in', label: 'Gate In', socket: 'voltage', description: 'Input gate or trigger pulse.' },
            { name: 'probInput', label: 'Prob CV', socket: 'voltage', description: 'CV modulating probability threshold.' }
        ],
        outputs: [
            { name: 'out', label: 'Gate Out', socket: 'voltage', description: 'Probabilistically passed gate signal.' }
        ],
        controls: [
            { key: 'probability', label: 'Probability', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Probability pass rate (0.0 = blocked, 1.0 = always passed).' }
        ],
        gotchas: [
            'Shares single-sample buffer for optimized memory polling during signal processing.'
        ]
    },
    LogicGatesNode: {
        title: 'Logic Gates',
        category: 'Modulation & Sequencing',
        description: 'Digital Boolean logic gate performing AND, OR, XOR, NAND, NOR, and XNOR operations on dual gate inputs.',
        filename: 'LogicGatesNode.md',
        inputs: [
            { name: 'inA', label: 'In A', socket: 'voltage', description: 'Digital gate input A.' },
            { name: 'inB', label: 'In B', socket: 'voltage', description: 'Digital gate input B.' }
        ],
        outputs: [
            { name: 'out', label: 'Out', socket: 'voltage', description: 'Boolean operation output gate pulse.' }
        ],
        controls: [
            { key: 'gateType', label: 'Logic Function', type: 'select', options: ['AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'], default: 'AND', description: 'Boolean logic truth operation.' }
        ],
        gotchas: [
            'Evaluates gate input high threshold at > 0.5V.'
        ]
    },
    ClockDividerNode: {
        title: 'Clock Divider',
        category: 'Modulation & Sequencing',
        description: 'Frequency divider producing sub-divided clock pulse signals (/2, /4, /8, /16) from a master clock input.',
        filename: 'ClockDividerNode.md',
        inputs: [
            { name: 'clock', label: 'Clock In', socket: 'voltage', description: 'Main clock input pulse stream.' }
        ],
        outputs: [
            { name: 'div2', label: '/2 Out', socket: 'voltage', description: 'Clock divided by 2.' },
            { name: 'div4', label: '/4 Out', socket: 'voltage', description: 'Clock divided by 4.' },
            { name: 'div8', label: '/8 Out', socket: 'voltage', description: 'Clock divided by 8.' },
            { name: 'div16', label: '/16 Out', socket: 'voltage', description: 'Clock divided by 16.' }
        ],
        controls: [],
        gotchas: [
            'Sub-divided outputs trigger synchronously on rising edges of incoming clock ticks.'
        ]
    },
    SignalInverterNode: {
        title: 'Inverter',
        category: 'Utilities',
        description: 'Signal phase inversion utility multiplying incoming audio or control voltage by -1.0x.',
        filename: 'SignalInverterNode.md',
        inputs: [
            { name: 'in', label: 'In', socket: 'voltage', description: 'Input signal.' }
        ],
        outputs: [
            { name: 'out', label: 'Out', socket: 'voltage', description: 'Inverted polarity output signal.' }
        ],
        controls: [],
        gotchas: [
            'Multiplies input polarity by -1.0 across both audio and CV signals.'
        ]
    },
    TuringMachineNode: {
        title: 'Turing Machine',
        category: 'Modulation & Sequencing',
        description: 'Random looping shift register generating evolving or locked rhythmic and melodic control voltage patterns.',
        filename: 'TuringMachineNode.md',
        inputs: [
            { name: 'clock', label: 'Clock In', socket: 'voltage', description: 'Clock input pulse to step register.' }
        ],
        outputs: [
            { name: 'out', label: 'CV Out', socket: 'voltage', description: 'Stepped control voltage output.' }
        ],
        controls: [
            { key: 'probability', label: 'Randomness', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Chance of flipping register bits on step (0 = locked sequence, 1 = total random).' },
            { key: 'length', label: 'Sequence Length', type: 'slider', min: 2, max: 16, step: 1, default: 8, description: 'Shift register sequence step length.' }
        ],
        gotchas: [
            'At 0.0 randomness, loops exact repeating pattern. At 0.5, randomly mutates register bits.'
        ]
    },
    SampleAndHoldNode: {
        title: 'Sample & Hold',
        category: 'Modulation & Sequencing',
        description: 'Sample & Hold circuit capturing instant voltage levels from an input signal upon receiving a trigger pulse.',
        filename: 'SampleAndHoldNode.md',
        inputs: [
            { name: 'in', label: 'Signal In', socket: 'voltage', description: 'Signal to sample.' },
            { name: 'trigger', label: 'Trigger In', socket: 'voltage', description: 'Trigger pulse input.' }
        ],
        outputs: [
            { name: 'out', label: 'CV Out', socket: 'voltage', description: 'Held voltage level output.' }
        ],
        controls: [],
        gotchas: [
            'Captures input voltage on rising edge of trigger signal and maintains constant output until next trigger.'
        ]
    },
    RandomVoltageNode: {
        title: 'Random Voltage',
        category: 'Modulation & Sequencing',
        description: 'Stepped random control voltage generator producing new random values within configured voltage bounds on clock triggers.',
        filename: 'RandomVoltageNode.md',
        inputs: [
            { name: 'clock', label: 'Clock In', socket: 'voltage', description: 'Clock trigger input.' }
        ],
        outputs: [
            { name: 'out', label: 'CV Out', socket: 'voltage', description: 'Stepped random CV output.' }
        ],
        controls: [
            { key: 'minVoltage', label: 'Min Volts', type: 'slider', min: -5, max: 5, step: 0.1, default: 0, description: 'Minimum random voltage bound.' },
            { key: 'maxVoltage', label: 'Max Volts', type: 'slider', min: -5, max: 5, step: 0.1, default: 5, description: 'Maximum random voltage bound.' }
        ],
        gotchas: [
            'Generates new random voltage bound between Min Volts and Max Volts on each rising clock edge.'
        ]
    },
    MixerNode: {
        title: 'Mixer',
        category: 'Effects',
        description: '4-channel audio and CV utility mixer with independent channel gain controls and master gain output level.',
        filename: 'MixerNode.md',
        inputs: [
            { name: 'ch1', label: 'Ch 1', socket: 'voltage', description: 'Channel 1 input.' },
            { name: 'ch2', label: 'Ch 2', socket: 'voltage', description: 'Channel 2 input.' },
            { name: 'ch3', label: 'Ch 3', socket: 'voltage', description: 'Channel 3 input.' },
            { name: 'ch4', label: 'Ch 4', socket: 'voltage', description: 'Channel 4 input.' }
        ],
        outputs: [
            { name: 'out', label: 'Mix Out', socket: 'voltage', description: 'Summed master output.' }
        ],
        controls: [
            { key: 'ch1Gain', label: 'Ch 1 Level', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.8, description: 'Channel 1 gain.' },
            { key: 'ch2Gain', label: 'Ch 2 Level', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.8, description: 'Channel 2 gain.' },
            { key: 'ch3Gain', label: 'Ch 3 Level', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.8, description: 'Channel 3 gain.' },
            { key: 'ch4Gain', label: 'Ch 4 Level', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.8, description: 'Channel 4 gain.' },
            { key: 'masterGain', label: 'Master Level', type: 'slider', min: 0, max: 1, step: 0.01, default: 1, description: 'Master output gain.' }
        ],
        gotchas: [
            'Summed channels pass through master gain before output. Key component for feedback routing loops.'
        ]
    },
    MasterGainOutputNode: {
        title: 'Output',
        category: 'Utilities',
        description: 'Master output node connecting synthesizer patch audio directly to Web Audio output speakers.',
        filename: 'OutputNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Main audio mix input.' }
        ],
        outputs: [],
        controls: [
            { key: 'volume', label: 'Master Volume', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.8, description: 'Global output volume level.' }
        ],
        gotchas: [
            'Connects directly to Web Audio destination speaker output and global master gain.'
        ]
    },
    FilterNode: {
        title: 'VCF',
        category: 'Effects',
        description: 'Voltage Controlled Filter featuring Lowpass, Highpass, Bandpass, and Notch modes with cutoff frequency and resonance control.',
        filename: 'VCFNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio signal.' },
            { name: 'cutoff_cv', label: 'Cutoff CV', socket: 'voltage', description: 'Cutoff frequency CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Filtered audio output.' }
        ],
        controls: [
            { key: 'frequency', label: 'Cutoff (Hz)', type: 'slider', min: 20, max: 20000, step: 1, default: 1000, description: 'Filter cutoff frequency.' },
            { key: 'type', label: 'Filter Type', type: 'select', options: ['lowpass', 'highpass', 'bandpass', 'notch'], default: 'lowpass', description: 'Filter frequency response type.' },
            { key: 'Q', label: 'Resonance (Q)', type: 'slider', min: 0.1, max: 20, step: 0.1, default: 1, description: 'Filter resonance peak.' }
        ],
        gotchas: [
            'Cutoff CV uses logarithmic frequency scaling.',
            'Resonance values near 20 approach self-oscillation.'
        ]
    },
    DelayNode: {
        title: 'Delay',
        category: 'Effects',
        description: 'Audio delay effect with adjustable delay time, feedback repeats, and dry/wet mix balance.',
        filename: 'DelayNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio signal.' },
            { name: 'time_cv', label: 'Time CV', socket: 'voltage', description: 'Delay time modulation input.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Delayed audio output.' }
        ],
        controls: [
            { key: 'delayTime', label: 'Time (s)', type: 'slider', min: 0.001, max: 2, step: 0.001, default: 0.3, description: 'Delay time in seconds.' },
            { key: 'feedback', label: 'Feedback', type: 'slider', min: 0, max: 0.95, step: 0.01, default: 0.4, description: 'Feedback repeat gain.' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Dry/wet mix balance.' }
        ],
        gotchas: [
            'Feedback capped at 0.95 to prevent runaway oscillation.',
            'Minimum delay time clamped to 1 render quantum (128 samples) when included in cyclic loops.'
        ]
    },
    PingPongDelayNode: {
        title: 'Ping Pong Delay',
        category: 'Effects',
        description: 'Stereo delay effect alternating echo repeats between left and right output channels.',
        filename: 'PingPongDelayNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' },
            { name: 'time_cv', label: 'Time CV', socket: 'voltage', description: 'Delay time CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Stereo ping-pong delayed output.' }
        ],
        controls: [
            { key: 'delayTime', label: 'Time (s)', type: 'slider', min: 0.001, max: 2, step: 0.001, default: 0.3, description: 'Delay time in seconds.' },
            { key: 'feedback', label: 'Feedback', type: 'slider', min: 0, max: 0.95, step: 0.01, default: 0.4, description: 'Stereo feedback level.' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Dry/wet mix level.' }
        ],
        gotchas: [
            'Alternates repeats between left and right channels using dual cross-fed delay lines.'
        ]
    },
    ChorusNode: {
        title: 'Chorus',
        category: 'Effects',
        description: 'Stereo chorus effect modulating dual delay lines with inverse LFO phases to create pitch detuned ensemble thickness.',
        filename: 'ChorusNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio signal.' },
            { name: 'rate_cv', label: 'Rate CV', socket: 'voltage', description: 'LFO modulation rate CV.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Stereo chorus output.' }
        ],
        controls: [
            { key: 'rate', label: 'Rate (Hz)', type: 'slider', min: 0.1, max: 10, step: 0.1, default: 1.5, description: 'Modulation rate speed.' },
            { key: 'depth', label: 'Depth', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Modulation delay depth.' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Dry/wet mix balance.' }
        ],
        gotchas: [
            'Uses dual LFO-modulated delay lines with anti-phase LFO offsets for wide stereo motion.'
        ]
    },
    PhaserNode: {
        title: 'Phaser',
        category: 'Effects',
        description: 'Multi-stage phaser cascading four all-pass filters modulated by LFO sweep to generate sweeping notch phase cancellation.',
        filename: 'PhaserNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' },
            { name: 'rate_cv', label: 'Rate CV', socket: 'voltage', description: 'Sweep rate CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Phased audio output.' }
        ],
        controls: [
            { key: 'rate', label: 'Rate (Hz)', type: 'slider', min: 0.1, max: 10, step: 0.1, default: 0.5, description: 'Modulation sweep frequency.' },
            { key: 'depth', label: 'Depth', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.7, description: 'Filter frequency sweep depth.' },
            { key: 'feedback', label: 'Feedback', type: 'slider', min: 0, max: 0.9, step: 0.01, default: 0.5, description: 'Resonance feedback.' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Dry/wet mix balance.' }
        ],
        gotchas: [
            'Cascades 4 all-pass filter stages modulated by an internal LFO to produce notch sweeping.'
        ]
    },
    FlangerNode: {
        title: 'Flanger',
        category: 'Effects',
        description: 'Short delay flanging effect with feedback and LFO rate modulation producing resonant jet-plane comb filter sweeps.',
        filename: 'FlangerNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' },
            { name: 'rate_cv', label: 'Rate CV', socket: 'voltage', description: 'Modulation sweep rate CV.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Flanged audio output.' }
        ],
        controls: [
            { key: 'rate', label: 'Rate (Hz)', type: 'slider', min: 0.05, max: 5, step: 0.01, default: 0.2, description: 'LFO sweep speed.' },
            { key: 'depth', label: 'Depth (ms)', type: 'slider', min: 0.1, max: 10, step: 0.1, default: 2, description: 'Delay time modulation depth in ms.' },
            { key: 'feedback', label: 'Feedback', type: 'slider', min: 0, max: 0.95, step: 0.01, default: 0.5, description: 'Feedback repeat gain.' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Dry/wet mix balance.' }
        ],
        gotchas: [
            'Short delay times (1-10ms) produce comb filtering jet-plane sweep textures.'
        ]
    },
    ArpeggiatorNode: {
        title: 'Arpeggiator',
        category: 'Modulation & Sequencing',
        description: 'Arpeggiator generating melodic note sequences from chord inputs or root selections with dual Audio and MIDI outputs.',
        filename: 'ArpeggiatorNode.md',
        inputs: [
            { name: 'clock', label: 'Clock In', socket: 'voltage', description: 'External clock pulse input.' },
            { name: 'midi', label: 'MIDI In', socket: 'midi', description: 'Incoming MIDI notes.' },
            { name: 'transpose_cv', label: 'Transpose CV', socket: 'voltage', description: 'Pitch transposition CV input.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio', socket: 'voltage', description: 'Internal synth audio output.' },
            { name: 'midi', label: 'MIDI Out', socket: 'midi', description: 'Arpeggiated MIDI note stream.' }
        ],
        controls: [
            { key: 'bpm', label: 'BPM', type: 'slider', min: 60, max: 240, step: 1, default: 120, description: 'Tempo when no external clock is connected.' },
            { key: 'noteDuration', label: 'Note Duration', type: 'select', options: ['1', '1/2', '1/4', '1/8', '1/16', '1/32', '1/64', '1/128'], default: '1/16', description: 'Note subdivision duration.' },
            { key: 'chordType', label: 'Chord Type', type: 'select', options: ['Major Triad', 'Minor Triad', 'Dominant 7th', 'Major 7th', 'Minor 7th', 'Sus2', 'Sus4', 'Diminished', 'Augmented'], default: 'Major Triad', description: 'Harmonic chord structure.' },
            { key: 'rootNote', label: 'Root Note', type: 'select', options: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], default: 'C4', description: 'Base note pitch.' },
            { key: 'pattern', label: 'Pattern', type: 'select', options: ['Up', 'Down', 'Up-Down', 'Down-Up', 'Random'], default: 'Up', description: 'Arpeggio playback direction.' },
            { key: 'octaves', label: 'Octaves', type: 'slider', min: 1, max: 4, step: 1, default: 1, description: 'Octave range span.' }
        ],
        gotchas: [
            'External Clock In overrides internal BPM slider.',
            'Outputs both live audio from built-in synth and MIDI triggers for external nodes.'
        ]
    },
    SequencerNode: {
        title: 'Sequencer',
        category: 'Modulation & Sequencing',
        description: 'Multi-step step sequencer supporting 4 to 64 steps, algorithmic pattern generators, and dual Gate and CV outputs.',
        filename: 'SequencerNode.md',
        inputs: [
            { name: 'clock', label: 'Clock In', socket: 'voltage', description: 'Step trigger clock pulse input.' }
        ],
        outputs: [
            { name: 'gate', label: 'Gate Out', socket: 'voltage', description: 'Trigger gate signal per step.' },
            { name: 'cv', label: 'CV Out', socket: 'voltage', description: 'Pitch CV signal per step.' }
        ],
        controls: [
            { key: 'bpm', label: 'BPM', type: 'slider', min: 40, max: 240, step: 1, default: 120, description: 'Tempo in BPM.' },
            { key: 'steps', label: 'Step Length', type: 'slider', min: 4, max: 64, step: 1, default: 32, description: 'Total sequence step length.' },
            { key: 'generationPattern', label: 'Gen Pattern', type: 'select', options: ['Up', 'Down', 'Up-Down', 'Down-Up', 'Scalar Walk', 'Motif Generator', 'Pentatonic Groove', 'Random'], default: 'Up', description: 'Algorithmic pattern generator.' },
            { key: 'mode', label: 'Mode', type: 'select', options: ['Scale', 'Chord'], default: 'Scale', description: 'Scale or chord quantization mode.' }
        ],
        gotchas: [
            'Supports step length from 4 to 64 steps with automatic reset on start/stop.'
        ]
    },
    DrumMachineNode: {
        title: 'Drum Machine',
        category: 'Sources',
        description: 'Pattern-based drum rhythm synthesizer supporting 808, 909, Chiptune, and Acoustic drum kits with mini-notation pattern triggers.',
        filename: 'drum-machine-node.md',
        inputs: [
            { name: 'clock', label: 'Clock In', socket: 'voltage', description: 'External rhythm clock pulse.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Stereo drum audio output.' }
        ],
        controls: [
            { key: 'bpm', label: 'BPM', type: 'slider', min: 60, max: 200, step: 1, default: 120, description: 'Playback speed in BPM.' },
            { key: 'kit', label: 'Drum Kit', type: 'select', options: ['808', '909', 'Chiptune', 'Acoustic'], default: '808', description: 'Drum voice soundbank.' }
        ],
        gotchas: [
            'Mini-notation trigger syntax: k (kick), s (snare), h (closed hat), o (open hat), c (clap), t (tom).'
        ]
    },
    MasterClockNode: {
        title: 'Clock',
        category: 'Utilities',
        description: 'Master clock pulse generator driving tempo synchronization across sequencers, drum machines, and arpeggiators.',
        filename: 'ClockNode.md',
        inputs: [],
        outputs: [
            { name: 'clock', label: 'Clock Out', socket: 'voltage', description: 'Master clock pulse stream.' }
        ],
        controls: [
            { key: 'bpm', label: 'BPM', type: 'slider', min: 30, max: 300, step: 1, default: 120, description: 'Tempo in beats per minute.' }
        ],
        gotchas: [
            'Sends precision clock pulses on every tick.',
            'Resets tick counter on transport restart and editor clear.'
        ]
    },
    StereoPannerNode: {
        title: 'Stereo Panner',
        category: 'Effects',
        description: 'Panoramic audio balance node positioning audio across left/right stereo spectrum manually or via CV modulation.',
        filename: 'StereoPannerNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' },
            { name: 'pan_cv', label: 'Pan CV', socket: 'voltage', description: 'Stereo pan CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Stereo panned output.' }
        ],
        controls: [
            { key: 'pan', label: 'Pan', type: 'slider', min: -1, max: 1, step: 0.01, default: 0, description: 'Pan position (-1 left, 0 center, +1 right).' }
        ],
        gotchas: [
            'Uses StereoPannerNode API when supported, falling back to equal-power GainNode split.'
        ]
    },
    DistortionNode: {
        title: 'Distortion',
        category: 'Effects',
        description: 'Waveshaper distortion effect providing Soft Clipping, Hard Clipping, and Fuzz algorithms with drive CV control.',
        filename: 'DistortionNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' },
            { name: 'drive_cv', label: 'Drive CV', socket: 'voltage', description: 'Drive modulation CV.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Distorted audio output.' }
        ],
        controls: [
            { key: 'drive', label: 'Drive', type: 'slider', min: 0, max: 100, step: 1, default: 20, description: 'Distortion intensity drive.' },
            { key: 'type', label: 'Type', type: 'select', options: ['soft', 'hard', 'fuzz'], default: 'soft', description: 'Distortion curve algorithm.' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 1, description: 'Dry/wet mix level.' }
        ],
        gotchas: [
            'Uses precomputed 4096-point Float32Array waveshaper transfer curves for zero-latency distortion.'
        ]
    },
    CompressorNode: {
        title: 'Compressor',
        category: 'Effects',
        description: 'Dynamic range compressor controlling audio peak spikes with adjustable threshold, ratio, attack, and release.',
        filename: 'CompressorNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Compressed audio output.' }
        ],
        controls: [
            { key: 'threshold', label: 'Threshold (dB)', type: 'slider', min: -60, max: 0, step: 1, default: -24, description: 'Compression activation threshold.' },
            { key: 'ratio', label: 'Ratio', type: 'slider', min: 1, max: 20, step: 0.1, default: 4, description: 'Compression ratio.' },
            { key: 'attack', label: 'Attack (s)', type: 'slider', min: 0.001, max: 1, step: 0.001, default: 0.003, description: 'Attack time.' },
            { key: 'release', label: 'Release (s)', type: 'slider', min: 0.01, max: 1, step: 0.01, default: 0.25, description: 'Release time.' }
        ],
        gotchas: [
            'Uses Web Audio DynamicsCompressorNode engine.'
        ]
    },
    ReverbNode: {
        title: 'Reverb',
        category: 'Effects',
        description: 'Algorithmic convolution reverb simulating spatial acoustic echo environments with decay time and CV control.',
        filename: 'ReverbNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' },
            { name: 'decay_cv', label: 'Decay CV', socket: 'voltage', description: 'Decay time CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Reverberated audio output.' }
        ],
        controls: [
            { key: 'decay', label: 'Decay Time (s)', type: 'slider', min: 0.1, max: 10, step: 0.1, default: 2, description: 'Reverb decay duration in seconds.' },
            { key: 'mix', label: 'Mix', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.3, description: 'Dry/wet mix level.' }
        ],
        gotchas: [
            'Generates synthetic impulse response buffer with exponentially decaying noise.'
        ]
    },
    LFONode: {
        title: 'LFO',
        category: 'Modulation & Sequencing',
        description: 'Low Frequency Oscillator generating sub-audio cyclic CV modulation waveforms (sine, square, sawtooth, triangle) with hard sync reset.',
        filename: 'LFONode.md',
        inputs: [
            { name: 'reset', label: 'Reset In', socket: 'voltage', description: 'Hard sync phase reset trigger.' }
        ],
        outputs: [
            { name: 'cv', label: 'CV Out', socket: 'voltage', description: 'LFO CV modulation signal.' }
        ],
        controls: [
            { key: 'frequency', label: 'Frequency (Hz)', type: 'slider', min: 0.01, max: 20, step: 0.01, default: 1, description: 'LFO cycle rate in Hz.' },
            { key: 'fineRate', label: 'Fine Rate (Hz)', type: 'slider', min: -0.5, max: 0.5, step: 0.01, default: 0, description: 'Fine frequency tuning offset.' },
            { key: 'waveform', label: 'Waveform', type: 'select', options: ['sine', 'square', 'sawtooth', 'triangle'], default: 'sine', description: 'LFO modulation shape.' },
            { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 0, max: 1, step: 0.01, default: 1, description: 'Peak CV output level.' }
        ],
        gotchas: [
            'Fine Rate allows sub-Hz precision control down to 0.01 Hz.'
        ]
    },
    EnvelopeFollowerNode: {
        title: 'Envelope Follower',
        category: 'Modulation & Sequencing',
        description: 'Dynamic amplitude tracker generating control voltage proportional to the peak envelope of incoming audio.',
        filename: 'EnvelopeFollowerNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Audio input stream.' }
        ],
        outputs: [
            { name: 'cv', label: 'CV Out', socket: 'voltage', description: 'Envelope CV signal.' }
        ],
        controls: [
            { key: 'sensitivity', label: 'Sensitivity', type: 'slider', min: 0, max: 10, step: 0.1, default: 1, description: 'Input sensitivity multiplier.' },
            { key: 'attack', label: 'Attack (s)', type: 'slider', min: 0.001, max: 1, step: 0.001, default: 0.01, description: 'Envelope rise speed.' },
            { key: 'release', label: 'Release (s)', type: 'slider', min: 0.001, max: 1, step: 0.001, default: 0.1, description: 'Envelope decay speed.' }
        ],
        gotchas: [
            'Converts dynamic audio volume peaks into continuous control voltage signals.'
        ]
    },
    ADSREnvelopeNode: {
        title: 'EG',
        category: 'Modulation & Sequencing',
        description: 'ADSR Envelope Generator generating Attack, Decay, Sustain, and Release contour signals for VCAs and VCFs.',
        filename: 'EGNode.md',
        inputs: [
            { name: 'gate', label: 'Gate In', socket: 'voltage', description: 'Gate trigger pulse input.' }
        ],
        outputs: [
            { name: 'cv', label: 'CV Out', socket: 'voltage', description: 'Envelope CV signal.' }
        ],
        controls: [
            { key: 'mode', label: 'Mode', type: 'select', options: ['EG', 'GATE', 'LFO'], default: 'EG', description: 'Operational mode (Envelope Generator, Gate, or auto LFO).' },
            { key: 'attack', label: 'Attack (s)', type: 'slider', min: 0.001, max: 2, step: 0.001, default: 0.01, description: 'Attack duration.' },
            { key: 'decay', label: 'Decay (s)', type: 'slider', min: 0.001, max: 2, step: 0.001, default: 0.1, description: 'Decay duration.' },
            { key: 'sustain', label: 'Sustain', type: 'slider', min: 0, max: 1, step: 0.01, default: 0.5, description: 'Sustain level.' },
            { key: 'release', label: 'Release (s)', type: 'slider', min: 0.001, max: 5, step: 0.001, default: 0.2, description: 'Release duration.' }
        ],
        gotchas: [
            'Exponential curve ramping on attack and release prevents audio pop artifacts.'
        ]
    },
    BitcrusherNode: {
        title: 'Bitcrusher',
        category: 'Effects',
        description: 'Lo-fi digital bit crusher reducing bit depth resolution and sample rate frequency for vintage digital crunch.',
        filename: 'BitcrusherNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Input audio.' },
            { name: 'bits_cv', label: 'Bits CV', socket: 'voltage', description: 'Bit depth CV modulation.' },
            { name: 'sr_cv', label: 'SR CV', socket: 'voltage', description: 'Sample rate reduction CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Bitcrushed audio output.' }
        ],
        controls: [
            { key: 'bits', label: 'Bit Depth', type: 'slider', min: 1, max: 16, step: 1, default: 8, description: 'Bit resolution (1 to 16 bits).' },
            { key: 'sampleRateReduction', label: 'Sample Rate Reduction', type: 'slider', min: 1, max: 20, step: 0.1, default: 1, description: 'Downsampling factor.' }
        ],
        gotchas: [
            'Powered by BitcrusherProcessor AudioWorklet. Per-channel phase arrays prevent multi-channel cross-bleeding.'
        ]
    },
    VocoderNode: {
        title: 'Vocoder',
        category: 'Effects',
        description: 'Multi-band vocoder applying vocal modulator spectral envelope filters onto carrier synthesis tones.',
        filename: 'VocoderNode.md',
        inputs: [
            { name: 'carrier', label: 'Carrier In', socket: 'voltage', description: 'Carrier synthesizer input.' },
            { name: 'modulator', label: 'Modulator In', socket: 'voltage', description: 'Modulator vocal input.' },
            { name: 'bands_cv', label: 'Bands CV', socket: 'voltage', description: 'Filter band count CV modulation.' },
            { name: 'formant_cv', label: 'Formant CV', socket: 'voltage', description: 'Formant shift CV modulation.' },
            { name: 'unvoiced_cv', label: 'Unvoiced CV', socket: 'voltage', description: 'Unvoiced sibilance CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Vocoded audio output.' }
        ],
        controls: [
            { key: 'frequency', label: 'Carrier Freq', type: 'slider', min: 50, max: 1000, step: 1, default: 110, description: 'Internal carrier base frequency.' },
            { key: 'waveform', label: 'Carrier Wave', type: 'select', options: ['sine', 'square', 'sawtooth', 'triangle'], default: 'sawtooth', description: 'Internal carrier wave shape.' },
            { key: 'numBands', label: 'Filter Bands', type: 'slider', min: 4, max: 32, step: 1, default: 16, description: 'Number of spectral filter bands.' },
            { key: 'formantShift', label: 'Formant Shift', type: 'slider', min: 0.5, max: 2, step: 0.01, default: 1, description: 'Formant shift multiplier.' }
        ],
        gotchas: [
            'Uses VocoderProcessor AudioWorklet for real-time parallel bandpass spectral tracking.'
        ]
    },
    AttenuverterNode: {
        title: 'Attenuverter',
        category: 'Utilities',
        description: 'Precision scale and polarity inversion node for scaling or flipping control voltages between -1.0x and +1.0x.',
        filename: 'AttenuverterNode.md',
        inputs: [
            { name: 'in', label: 'In', socket: 'voltage', description: 'Input signal.' }
        ],
        outputs: [
            { name: 'out', label: 'Out', socket: 'voltage', description: 'Scaled or inverted output.' }
        ],
        controls: [
            { key: 'level', label: 'Level', type: 'slider', min: -1, max: 1, step: 0.01, default: 1, description: 'Gain multiplier (-1 to +1).' }
        ],
        gotchas: [
            'At 0.0 mutes signal; at +1.0 passes unchanged; at -1.0 flips phase polarity.'
        ]
    },
    QuantizerNode: {
        title: 'Quantizer',
        category: 'Modulation & Sequencing',
        description: 'Pitch quantizer constraining continuous unquantized CV signals to exact semitones of selected musical scales.',
        filename: 'quantizer-node.md',
        inputs: [
            { name: 'in', label: 'CV In', socket: 'voltage', description: 'Unquantized control voltage input.' }
        ],
        outputs: [
            { name: 'out', label: 'CV Out', socket: 'voltage', description: 'Quantized 1V/Oct CV output signal.' }
        ],
        controls: [
            { key: 'rootNote', label: 'Root Note', type: 'select', options: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], default: 'C4', description: 'Root key.' },
            { key: 'scaleType', label: 'Scale', type: 'select', options: ['Major (Ionian)', 'Natural Minor (Aeolian)', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian', 'Pentatonic Major', 'Pentatonic Minor', 'Blues'], default: 'Major (Ionian)', description: 'Target musical scale constraint.' }
        ],
        gotchas: [
            'Snaps continuous voltage values to nearest semitone in the selected musical scale.'
        ]
    },
    GranularSynthesizerNode: {
        title: 'Granular Synthesizer',
        category: 'Sources',
        description: 'Real-time granular synthesis engine splitting incoming or recorded audio into microscopic grains with time/pitch jitter.',
        filename: 'GranularSynthesizerNode.md',
        inputs: [
            { name: 'audio', label: 'Audio In', socket: 'voltage', description: 'Live audio stream input.' },
            { name: 'grainSizeCV', label: 'Grain Size CV', socket: 'voltage', description: 'Grain size CV modulation.' },
            { name: 'grainDensityCV', label: 'Grain Density CV', socket: 'voltage', description: 'Grain density CV modulation.' },
            { name: 'pitchShiftCV', label: 'Pitch Shift CV', socket: 'voltage', description: 'Pitch transpose CV modulation.' },
            { name: 'positionJitterCV', label: 'Jitter CV', socket: 'voltage', description: 'Position jitter CV modulation.' }
        ],
        outputs: [
            { name: 'audio', label: 'Audio Out', socket: 'voltage', description: 'Granular synthesized audio output.' }
        ],
        controls: [
            { key: 'grainSize', label: 'Grain Size (s)', type: 'slider', min: 0.01, max: 0.5, step: 0.001, default: 0.1, description: 'Grain playback window duration.' },
            { key: 'grainDensity', label: 'Grain Density (Hz)', type: 'slider', min: 1, max: 100, step: 1, default: 20, description: 'Grains per second density.' },
            { key: 'pitchShift', label: 'Pitch Shift (st)', type: 'slider', min: -12, max: 12, step: 1, default: 0, description: 'Pitch transposition in semitones.' },
            { key: 'positionJitter', label: 'Jitter (s)', type: 'slider', min: 0, max: 0.2, step: 0.001, default: 0.02, description: 'Buffer offset randomization.' }
        ],
        gotchas: [
            'Powered by GranularProcessor AudioWorklet.',
            'Overlapping grains use Gaussian window envelopes.'
        ]
    }
};

const htmlPath = path.join(__dirname, '../_layouts/default.html');
let html = fs.readFileSync(htmlPath, 'utf8');

let updatedCount = 0;
for (const [className, meta] of Object.entries(metadataMap)) {
    const metaStr = `\n            static metadata = ${JSON.stringify(meta, null, 16)};\n`;

    // Check if class already has static metadata
    const classRegex = new RegExp(`(class\\s+${className}\\s+extends\\s+[^{]+\\{)`);
    if (classRegex.test(html)) {
        // If static metadata is already present, replace it
        const hasMetaRegex = new RegExp(`class\\s+${className}\\s+extends\\s+[^{]+\\{\\s*static\\s+metadata\\s*=\\s*\\{[\\s\\S]*?\\};`);
        if (hasMetaRegex.test(html)) {
            html = html.replace(hasMetaRegex, `$1${metaStr}`);
        } else {
            html = html.replace(classRegex, `$1${metaStr}`);
        }
        updatedCount++;
    } else {
        console.warn(`Class ${className} not found in _layouts/default.html`);
    }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log(`Successfully injected metadata into ${updatedCount} classes in _layouts/default.html.`);
