const { performance } = require('perf_hooks');

// ==========================================
// 1. Distortion Curve Benchmark
// ==========================================
function makeDistortionCurve_Old(amount, drive) {
    const k = typeof amount === 'number' ? amount : 50;
    const d = typeof drive === 'number' ? drive : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * (20 + d) * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

function makeDistortionCurve_New(amount, drive) {
    const k = typeof amount === 'number' ? amount : 50;
    const d = typeof drive === 'number' ? drive : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    const factor = (3 + k) * (20 + d) * deg;
    for (let i = 0; i < n_samples; ++i) {
        const x = i * 2 / n_samples - 1;
        curve[i] = factor * x / (Math.PI + k * Math.abs(x));
    }
    return curve;
}

// ==========================================
// 2. Reverb Impulse Response Benchmark
// ==========================================
function generateImpulseResponse_Old(duration, decay, sampleRate = 44100) {
    const length = sampleRate * duration;
    const left = new Float32Array(length);
    const right = new Float32Array(length);

    for (let i = 0; i < length; i++) {
        const n = length - i;
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return { left, right };
}

function generateImpulseResponse_New(duration, decay, sampleRate = 44100) {
    const length = sampleRate * duration;
    const left = new Float32Array(length);
    const right = new Float32Array(length);
    const invLength = 1 / length;

    for (let i = 0; i < length; i++) {
        const env = Math.pow(1 - i * invLength, decay);
        left[i] = (Math.random() * 2 - 1) * env;
        right[i] = (Math.random() * 2 - 1) * env;
    }
    return { left, right };
}

// ==========================================
// 3. Granular Window Benchmark (Math.sin vs Table Lookup)
// ==========================================
function granularLoop_Old(gSize, gPitch, numGrains, outLen = 128) {
    let sum = 0;
    for (let g = 0; g < numGrains; g++) {
        let gPlayPos = 0;
        for (let j = 0; j < outLen; j++) {
            const sample = 0.5; // dummy sample
            const window = Math.sin(Math.PI * (gPlayPos / gSize));
            sum += sample * window;
            gPlayPos += gPitch;
        }
    }
    return sum;
}

const windowTable = new Float32Array(2048);
for (let i = 0; i < 2048; i++) {
    windowTable[i] = Math.sin(Math.PI * i / 2047);
}

function granularLoop_New(gSize, gPitch, numGrains, outLen = 128) {
    let sum = 0;
    for (let g = 0; g < numGrains; g++) {
        let gPlayPos = 0;
        for (let j = 0; j < outLen; j++) {
            const sample = 0.5; // dummy sample
            let tableIndex = Math.floor((gPlayPos / gSize) * 2047);
            if (tableIndex < 0) tableIndex = 0;
            else if (tableIndex > 2047) tableIndex = 2047;
            const window = windowTable[tableIndex];
            sum += sample * window;
            gPlayPos += gPitch;
        }
    }
    return sum;
}

// ==========================================
// 4. Bitcrusher Benchmark
// ==========================================
function bitcrusher_Old(input, bits, sampleRateReduction) {
    const output = new Float32Array(input.length);
    let phase = 0;
    let lastSample = 0;
    for (let i = 0; i < input.length; ++i) {
        let currentSample = input[i];
        const step = Math.pow(0.5, bits);
        currentSample = Math.floor(currentSample / step) * step;
        phase += 1 / sampleRateReduction;
        if (phase >= 1) {
            phase--;
            lastSample = currentSample;
        }
        output[i] = lastSample;
    }
    return output;
}

function bitcrusher_New(input, bits, sampleRateReduction) {
    const output = new Float32Array(input.length);
    const step = Math.pow(0.5, bits);
    const phaseIncrement = 1 / sampleRateReduction;
    let phase = 0;
    let lastSample = 0;
    for (let i = 0; i < input.length; ++i) {
        let currentSample = input[i];
        currentSample = Math.floor(currentSample / step) * step;
        phase += phaseIncrement;
        if (phase >= 1) {
            phase--;
            lastSample = currentSample;
        }
        output[i] = lastSample;
    }
    return output;
}


// Run Benchmarks
console.log('=== AUDIO STREAM DSP PERFORMANCE BENCHMARKS ===\n');

// Distortion Benchmark
let start = performance.now();
for (let i = 0; i < 500; i++) {
    makeDistortionCurve_Old(50, 50);
}
let tOld = performance.now() - start;

start = performance.now();
for (let i = 0; i < 500; i++) {
    makeDistortionCurve_New(50, 50);
}
let tNew = performance.now() - start;
console.log(`1. Distortion Curve (500 gens): Old = ${tOld.toFixed(2)}ms, New = ${tNew.toFixed(2)}ms. Speedup = ${(tOld / tNew).toFixed(2)}x`);

// Reverb Impulse Response
start = performance.now();
for (let i = 0; i < 20; i++) {
    generateImpulseResponse_Old(2.0, 2.0);
}
tOld = performance.now() - start;

start = performance.now();
for (let i = 0; i < 20; i++) {
    generateImpulseResponse_New(2.0, 2.0);
}
tNew = performance.now() - start;
console.log(`2. Reverb Impulse Gen (20 gens): Old = ${tOld.toFixed(2)}ms, New = ${tNew.toFixed(2)}ms. Speedup = ${(tOld / tNew).toFixed(2)}x`);

// Granular Loop Windowing
start = performance.now();
for (let i = 0; i < 50000; i++) {
    granularLoop_Old(4410, 1.2, 10);
}
tOld = performance.now() - start;

start = performance.now();
for (let i = 0; i < 50000; i++) {
    granularLoop_New(4410, 1.2, 10);
}
tNew = performance.now() - start;
console.log(`3. Granular Windowing (50,000 blocks): Old = ${tOld.toFixed(2)}ms, New = ${tNew.toFixed(2)}ms. Speedup = ${(tOld / tNew).toFixed(2)}x`);

// Bitcrusher Loop
const dummyInput = new Float32Array(128000).map(() => Math.random() * 2 - 1);
start = performance.now();
for (let i = 0; i < 100; i++) {
    bitcrusher_Old(dummyInput, 8, 2);
}
tOld = performance.now() - start;

start = performance.now();
for (let i = 0; i < 100; i++) {
    bitcrusher_New(dummyInput, 8, 2);
}
tNew = performance.now() - start;
console.log(`4. Bitcrusher Loop (100 blocks of 128k samples): Old = ${tOld.toFixed(2)}ms, New = ${tNew.toFixed(2)}ms. Speedup = ${(tOld / tNew).toFixed(2)}x`);

console.log('\n=============================================');
