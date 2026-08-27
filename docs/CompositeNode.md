# Sub-Circuit / Composite Node

The **Composite Node** (Sub-Circuit) allows building modular node networks inside a single node, encapsulating sub-circuit building blocks (such as oscillators, filters, delays, and envelopes) into reusable modules with custom input and output ports.

---

## Overview & Architecture

Composite nodes enable hierarchically nesting audio circuits inside an outer node. This brings several advantages to modular synth patching:
- **Clean Workspace Layout**: Complex multi-stage synthesis patches (e.g. Chorus unit, Ping-Pong Delay, FM operator macro) can be grouped inside a single node.
- **Dynamic Sockets**: Adding or editing `Sub-Circuit Input` or `Sub-Circuit Output` nodes within the sub-circuit automatically generates matching voltage sockets on the outer Composite Node.
- **Presets & Sub-Components**: Pre-configured sub-circuits (such as Chorus or Ping-Pong Delay) can be selected via the preset dropdown menu.
- **Infinite Nesting**: Composite nodes can contain sub-circuits, enabling recursive abstraction while enforcing safety checks against self-referential cycle loops.

---

## Inner Port Nodes

Inside a Composite Node sub-circuit, signal boundaries between the outer workspace graph and inner sub-graph are established using two boundary port nodes:

1. **Sub-Circuit Input**:
   - Accepts external audio or CV signals from the outer workspace.
   - Provides a `Signal Out` socket inside the sub-circuit to route into internal building blocks.
   - Controls:
     - `Port Name` (text field): Customizes the socket label exposed on the outer node (e.g., `In 1`, `Carrier`, `FM Mod`).

2. **Sub-Circuit Output**:
   - Collects processed audio or CV signals inside the sub-circuit via its `Signal In` socket.
   - Outputs the signal to external nodes connected to the outer Composite Node.
   - Controls:
     - `Port Name` (text field): Customizes the socket label exposed on the outer node (e.g., `Out 1`, `Wet Out`).

---

## Editing Sub-Circuits

1. **Adding a Composite Node**:
   - Open the **Add Node** menu (➕) and click **🧩 Sub-Circuit** under Utilities, or right-click the canvas and select `Composite Node`.
2. **Editing Internal Circuit**:
   - Click the **🔍 Edit Sub-Circuit** button on the node.
   - An overlay editor opens with breadcrumb navigation (`Studio / Composite Node`).
   - Use **+ Input Port** or **+ Output Port** to create signal boundaries.
   - Connect building blocks (such as VCO, Delay, LFO, Filter, or VCA) inside the sub-canvas.
3. **Preset Templates**:
   - Select predefined sub-circuits from the **Preset Template** dropdown (e.g., `Chorus Sub-Circuit`, `Ping-Pong Delay Sub-Circuit`).

---

## Signal Flow & Routing Strategy

Inside `VoltageConnectionStrategy`, connections between outer nodes and inner Composite Node sockets are automatically mapped:
- External signals connected to `in_<id>` sockets route directly to the corresponding `SubCircuitInputPort` gain stage inside the sub-circuit.
- Signals passing into `out_<id>` ports inside the sub-circuit route directly to the corresponding `SubCircuitOutputPort` gain stage, which delivers audio to outer target nodes.
