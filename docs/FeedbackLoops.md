# Feedback Loops & Cyclic Routing

In modular synthesis, routing signals back into themselves (feedback) is a powerful technique for creating complex, evolving textures, generative melodies, and physical modeling-style sound design.

With the introduction of **Cyclic Routing** support in our application, you can now connect any output port back into any input port, even if it creates a loop/cycle. However, because we build upon the **Web Audio API**, there are important technical constraints you must understand to make your feedback patches audible.

---

## Web Audio API Specifications & Limitations

The Web Audio API natively allows cyclic graphs, but enforces strict rules to prevent immediate infinite recursion (which would freeze the browser or crash the audio thread).

### 1. The 128-Sample Rendering Quantum Delay
Web Audio processes sound in blocks of 128 sample-frames (known as a *render quantum*). At a standard sample rate of 44.1kHz, 128 samples is approximately **2.9 milliseconds**.
- To calculate a cycle, the rendering engine must be able to resolve dependencies. Therefore, **a cycle is only allowed if there is at least one `DelayNode`** in the loop.
- The `DelayNode` introduces the necessary 128-sample delay (one render quantum) to break the instantaneous dependency.
- Consequently, **instantaneous sample-by-sample feedback is not natively possible** via standard Web Audio graph connections. Any feedback loop will have a minimum latency of ~2.9ms.

### 2. Clamped Delay Times
If a `Delay` node is placed in a feedback loop, its `delayTime` is automatically clamped to a minimum of **1 render quantum (128 samples / ~2.9ms)**. Even if you set the Delay slider to `0.0s`, the browser will internally enforce the 2.9ms delay to keep the feedback loop stable.

### 3. Automatic Muting of Invalid Cycles
If you create a cycle that **does not contain any `DelayNode`** (for example, connecting a `VCO` directly to a `VCF`, and routing the `VCF` back to modulate the `VCO`'s frequency), the Web Audio API engine detects the cycle during rendering and **automatically mutes/silences that connection**. No error is thrown in the UI or console, but no signal will pass through the muted path.

### 4. AudioParam Feedback Loops
Connecting an output of a node back to one of its own `AudioParam` inputs (such as modulating its own frequency) also forms a cycle. Like node-to-node cycles, these will be muted unless a `Delay` node is inserted into the path.

---

## Practical Application: How to Create Feedback Loops

To make feedback loops work successfully, always include a **Delay** or **Ping Pong Delay** node in your loop.

### Recommended Patch: Mixer-Delay Feedback Loop
The most common way to create controlled feedback in modular synthesis is by using a **Mixer** and a **Delay** node:
1. Connect a **VCO** (or any sound source) to **Mixer Input 1** (`in1`).
2. Connect the **Mixer Audio Out** to the **Delay Audio In**.
3. Connect the **Delay Audio Out** back to **Mixer Input 2** (`in2`). This completes the feedback loop!
4. Connect the **Mixer Audio Out** to the **Output** node to listen.
5. Use the Mixer's `gain2` slider to control the feedback amount (attenuation), and `gain1` to control the dry input.

*Note: Be careful when increasing the feedback gain (such as Mixer `gain2` above 1.0) as it can quickly saturate and cause extreme loudness or distortion!*

---

## Editor Cycle Detection & Assistant

To help you design patches and debug silent loops, our editor includes an interactive **Cycle Detection Assistant** that runs in the background.

When you create or modify connections in the workspace:
1. The editor performs a **Depth-First Search (DFS)** traversal of the active Rete graph.
2. If it detects a loop/cycle, it checks all nodes involved in that loop.
3. **If a Delay or Ping Pong Delay node is found in the cycle:**
   It logs a validation success message in the developer console:
   `[Cycle Detection] Valid feedback loop detected (contains Delay)!`
4. **If no Delay node is found in the cycle:**
   It logs a highly descriptive warning in the developer console:
   `[Cycle Detection] ⚠️ Warning: Feedback loop detected without a Delay node! Web Audio API will mute this connection. Add a Delay or Ping Pong Delay node to make it audible.`

By keeping your browser console open, you can receive real-time guidance on whether your feedback routing is valid and audible!
