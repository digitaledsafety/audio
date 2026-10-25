# Modular Synth DSP Architecture & Concepts

This document details the mathematical models and digital signal processing (DSP) solutions used in this modular synthesizer web application to translate continuous analog circuit behaviors into real-time Web Audio API algorithms.

---

## 1. Non-Linear Circuit & Distortion Modeling

* **Problem:** Analog synth circuits (like diode clippers, transistor amplifiers, and drive stages) exhibit non-linear transfer functions. Hard digital clipping introduces harsh, unmusical aliasing.
* **Implementation:**
  - **Distortion & Drive (`DistortionNode`, `VCANode`):** Non-linear hyperbolic tangent ($\tanh$) and soft-clipping polynomial curves implemented via `WaveShaperNode`.
  - **Oversampling:** $4\times$ oversampling (`oversample = '4x'`) is enabled on non-linear `WaveShaperNode` processing blocks to suppress aliasing harmonics prior to downsampling.

---

## 2. Bandlimiting & Anti-Aliasing (Oscillators)

* **Problem:** Naive digital generation of geometric waveforms (sawtooth, square, triangle) contains infinite harmonic frequencies that alias past the Nyquist limit ($f_s / 2$).
* **Implementation:**
  - **Fourier Additive Synthesis (`ToneGenerator` / VCO, `ChordGenerator`):** Uses Web Audio `PeriodicWave` tables synthesized from Fourier series coefficients with Lanczos sigma factor windowing ($\text{sinc}$ damping) to eliminate high-register aliasing.

---

## 3. Analog-Matched Filter Topology (VCFs)

* **Problem:** Standard digital filters can warp cutoff responses or lack the resonant character of 4-pole analog transistor ladder filters.
* **Implementation:**
  - **Multi-Stage Topologies (`FilterNode` / VCF):** Supports selectable 2-pole ($12\text{ dB/oct}$) and 4-pole ($24\text{ dB/oct}$) cascaded filter topologies with an internal non-linear soft-saturation stage in the feedback loop.
  - **Unified AudioParam Control:** High-precision `ConstantSourceNode` proxies align dual filter stage cutoffs and Q parameters without phase mismatch.

---

## 4. Audio-Rate Control Signal Processing & Modulation

* **Problem:** Control voltage (CV) parameters updated at block rates cause audible stair-stepping (zipper noise) when modulated by LFOs or envelopes running at audio frequencies.
* **Implementation:**
  - **Audio-Rate CV Mapping:** Modulation signals (LFO, EG, Attenuverter) route directly as audio-rate signals connected to target Web Audio `AudioParam` inputs.
  - **Sub-Millisecond Smooth Ramping:** Parameter updates employ `setTargetAtTime` exponential smoothing ($1\text{ms}$ to $10\text{ms}$ constants) to maintain click-free transitions.

---

## 5. Module Interconnection & Dynamic Graph Routing

* **Problem:** User-configurable patch graphs introduce arbitrary routing, feedback loops, and dynamic connection updates on the fly.
* **Implementation:**
  - **VoltageConnectionStrategy:** Manages dynamic socket routing, automatic type strategy detection, and single-sample audio graph updates.
  - **Feedback Safeguards & Popup Protection:** Ramps `masterGain` smoothly over $15\text{ms}$ during workspace startup/shutdown to eliminate initial transient popping.

---

## 6. Wavefolding, Granular, & Time-Domain Transformations

* **Problem:** Time-domain transformations (granular synthesis, pitch shifting, wavefolding) introduce phase clicks at grain boundaries or severe aliasing during folding.
* **Implementation:**
  - **Anti-Aliased Wavefolding (`WavefolderNode`):** Continuous trigonometric folding function combined with $4\times$ oversampling.
  - **Hann Window Grain Envelopes (`GranularSynthesizer`):** Smooth $C^1$-continuous Hann window envelope smoothing ($0.5 \cdot (1 - \cos(2\pi \cdot \text{phase}))$) applied to active grain buffers to ensure click-free summation.
