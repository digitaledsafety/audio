# Embedding Modular Synthesizer Workspaces

Modular Studio provides a developer-friendly Web Component (`<modular-synth>` / `<modular-preview>`) allowing 3rd-party websites, blogs, and documentation pages to embed live interactive synthesizer workspaces and real-time Web Audio/WebGL visualizers.

---

## ⚡ Quick Start

Include the embed script once in your HTML page:

```html
<script src="https://audio.digitaleducationsafety.org/assets/js/modular-embed.js" defer></script>
```

Then place the custom element wherever you want the synth preview to appear:

```html
<modular-synth workspace="ambient-garden"></modular-synth>
```

---

## ⚙️ Attributes & Configuration

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `workspace` (or `preset`) | `string` | `"ambient-garden"` | The preset workspace name (e.g. `waves-drone`, `ambient-garden`, `generative-acid`). |
| `autoplay` | `boolean` | `false` | When present and not `"false"`, immediately launches audio upon load (subject to browser autoplay policies). |
| `volume` | `number` | `0.5` | Initial output master volume between `0.0` and `1.0`. |
| `title` | `string` | derived from preset | Custom label to display on the player title bar. |
| `src` | `string` | current origin | Custom base URL if hosting Modular Studio on another origin or path. |

---

## 🎨 Sizing & Styling

The `<modular-synth>` element behaves as a standard block-level element. You can style its dimensions directly with CSS:

```html
<modular-synth workspace="waves-drone" style="max-width: 650px; height: 380px;"></modular-synth>
```

---

## 🔒 Security & Performance Features

- **Sandboxed IFrame Architecture**: Audio graph compilation, WebGL canvases, and JavaScript DSP nodes run in an isolated frame within the component's Shadow DOM, preventing CSS leaks, script namespace pollution, or script collisions with your host site.
- **Intersection Observer Lifecycle**: Automatically pauses audio playback and visualizer rendering when scrolled out of view to save battery and CPU, then resumes smoothly when scrolled back in.
- **Click-to-Play Overlay**: Accommodates modern browser Web Audio autoplay security policies with a sleek pulsing play button and visualizer poster.
- **Clean Teardown**: Automatically disposes of Web Audio contexts and canvas animation frames when the element is removed from the DOM (`disconnectedCallback`).

---

## 💻 Programmatic JavaScript API

You can also create or control elements dynamically in JavaScript:

```javascript
const synth = document.createElement('modular-synth');
synth.setAttribute('workspace', 'ambient-garden');
synth.setAttribute('volume', '0.7');
document.body.appendChild(synth);
```
