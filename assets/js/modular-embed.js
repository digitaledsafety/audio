/**
 * Modular Synth Embed Web Component
 * <modular-synth> and <modular-preview>
 *
 * Provides a performant, aesthetically pleasing, and secure embeddable synthesizer preview
 * backed by an isolated iframe rendering real-time Web Audio DSP & WebGL visualizers.
 *
 * Attributes:
 * - workspace / preset: string (e.g. "ambient-garden", "waves-drone")
 * - autoplay: boolean attribute or "true" | "false" (default: false to respect browser autoplay policy)
 * - volume: number (0.0 to 1.0, default: 0.5)
 * - src: custom base url (defaults to current origin/script origin)
 * - title: custom display title override
 */
(function() {
    'use strict';

    // Avoid duplicate registration
    if (customElements.get('modular-synth')) {
        return;
    }

    // Determine default base URL from the current script location or window origin
    function resolveBaseUrl() {
        if (document.currentScript && document.currentScript.src) {
            try {
                const url = new URL(document.currentScript.src);
                return url.origin + url.pathname.replace(/\/assets\/js\/[^/]+$/, '/');
            } catch (e) {}
        }
        return window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/');
    }

    const DEFAULT_BASE_URL = resolveBaseUrl();

    class ModularSynthEmbed extends HTMLElement {
        static get observedAttributes() {
            return ['workspace', 'preset', 'volume', 'autoplay'];
        }

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            this._isPlaying = false;
            this._isReady = false;
            this._hasUserInteracted = false;
            this._volume = 0.5;
            this._intersectionObserver = null;
            this._wasPlayingBeforeHidden = false;

            this._handleMessage = this._handleMessage.bind(this);
            this._togglePlay = this._togglePlay.bind(this);
            this._handleVolumeChange = this._handleVolumeChange.bind(this);
            this._handleIntersection = this._handleIntersection.bind(this);
        }

        connectedCallback() {
            this._render();
            window.addEventListener('message', this._handleMessage);
            this._setupIntersectionObserver();
        }

        disconnectedCallback() {
            window.removeEventListener('message', this._handleMessage);
            if (this._intersectionObserver) {
                this._intersectionObserver.disconnect();
                this._intersectionObserver = null;
            }
            this._teardownIframe();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) return;

            if (name === 'volume') {
                const vol = parseFloat(newValue);
                if (!isNaN(vol)) {
                    this._volume = Math.max(0, Math.min(1, vol));
                    this._postToIframe({ action: 'setVolume', value: this._volume });
                    const volInput = this.shadowRoot && this.shadowRoot.getElementById('volume-slider');
                    if (volInput) volInput.value = this._volume;
                }
            } else if ((name === 'workspace' || name === 'preset') && this.shadowRoot) {
                this._updateIframeSrc();
            }
        }

        get workspace() {
            return this.getAttribute('workspace') || this.getAttribute('preset') || 'ambient-garden';
        }

        set workspace(val) {
            this.setAttribute('workspace', val);
        }

        get volume() {
            return this._volume;
        }

        set volume(val) {
            this.setAttribute('volume', val);
        }

        get isAutoplay() {
            return this.hasAttribute('autoplay') && this.getAttribute('autoplay') !== 'false';
        }

        _getStudioUrl() {
            const baseUrl = this.getAttribute('src') || DEFAULT_BASE_URL;
            const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
            return `${cleanBase}index.html?workspace=${encodeURIComponent(this.workspace)}`;
        }

        _getEmbedUrl() {
            const baseUrl = this.getAttribute('src') || DEFAULT_BASE_URL;
            const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
            const autoplayVal = this.isAutoplay ? 'true' : 'false';
            return `${cleanBase}index.html?workspace=${encodeURIComponent(this.workspace)}&embed=true&preview=true&autoplay=${autoplayVal}&volume=${this._volume}`;
        }

        _render() {
            const title = this.getAttribute('title') || this.workspace.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const studioUrl = this._getStudioUrl();

            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        position: relative;
                        width: 100%;
                        height: 420px;
                        min-height: 280px;
                        border-radius: 16px;
                        overflow: hidden;
                        background-color: #020617;
                        border: 1px solid rgba(51, 65, 85, 0.7);
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
                        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                        color: #f8fafc;
                        box-sizing: border-box;
                    }
                    *, *::before, *::after {
                        box-sizing: border-box;
                    }
                    .embed-container {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                    }
                    iframe {
                        position: absolute;
                        inset: 0;
                        width: 100%;
                        height: 100%;
                        border: none;
                        background: #020617;
                    }
                    /* Poster Overlay before first play */
                    .poster-overlay {
                        position: absolute;
                        inset: 0;
                        z-index: 20;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: radial-gradient(circle at center, rgba(30, 27, 75, 0.75) 0%, rgba(2, 6, 23, 0.95) 100%);
                        backdrop-filter: blur(4px);
                        transition: opacity 0.35s ease, visibility 0.35s;
                        cursor: pointer;
                        user-select: none;
                    }
                    .poster-overlay.hidden {
                        opacity: 0;
                        visibility: hidden;
                        pointer-events: none;
                    }
                    .play-pulse-btn {
                        width: 68px;
                        height: 68px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 0 30px rgba(99, 102, 241, 0.5);
                        color: white;
                        font-size: 26px;
                        cursor: pointer;
                        transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
                    }
                    .poster-overlay:hover .play-pulse-btn {
                        transform: scale(1.1);
                        box-shadow: 0 0 40px rgba(168, 85, 247, 0.7);
                    }
                    .poster-title {
                        font-size: 16px;
                        font-weight: 700;
                        letter-spacing: -0.01em;
                        margin-top: 16px;
                        color: #f1f5f9;
                    }
                    .poster-subtitle {
                        font-size: 12px;
                        color: #94a3b8;
                        margin-top: 4px;
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .badge-dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background-color: #10b981;
                        display: inline-block;
                        box-shadow: 0 0 8px #10b981;
                    }
                    /* Top Glass Bar */
                    .top-bar {
                        position: absolute;
                        top: 12px;
                        left: 12px;
                        right: 12px;
                        z-index: 10;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 8px 14px;
                        border-radius: 12px;
                        background: rgba(15, 23, 42, 0.75);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        pointer-events: auto;
                    }
                    .info-badge {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: 0;
                    }
                    .pulse-indicator {
                        position: relative;
                        width: 8px;
                        height: 8px;
                        flex-shrink: 0;
                    }
                    .pulse-indicator::before {
                        content: '';
                        position: absolute;
                        inset: -2px;
                        border-radius: 50%;
                        background: #10b981;
                        opacity: 0.6;
                        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                    }
                    .pulse-indicator::after {
                        content: '';
                        position: absolute;
                        inset: 0;
                        border-radius: 50%;
                        background: #10b981;
                    }
                    @keyframes ping {
                        75%, 100% {
                            transform: scale(2.2);
                            opacity: 0;
                        }
                    }
                    .workspace-title {
                        font-size: 13px;
                        font-weight: 600;
                        color: #f8fafc;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .tag-label {
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        color: #818cf8;
                        font-weight: 700;
                    }
                    /* Controls Bottom Bar */
                    .controls-bar {
                        position: absolute;
                        bottom: 12px;
                        left: 12px;
                        right: 12px;
                        z-index: 10;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        gap: 12px;
                        padding: 8px 14px;
                        border-radius: 12px;
                        background: rgba(15, 23, 42, 0.85);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        pointer-events: auto;
                    }
                    .left-controls {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .icon-btn {
                        background: #1e293b;
                        color: #f8fafc;
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 6px 10px;
                        font-size: 13px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        font-weight: 600;
                        transition: all 0.2s;
                        line-height: 1;
                    }
                    .icon-btn:hover {
                        background: #6366f1;
                        border-color: #6366f1;
                        color: #ffffff;
                    }
                    .volume-group {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                    }
                    .volume-group span {
                        font-size: 12px;
                        color: #94a3b8;
                    }
                    input[type="range"] {
                        -webkit-appearance: none;
                        width: 70px;
                        height: 4px;
                        border-radius: 2px;
                        background: #334155;
                        outline: none;
                        cursor: pointer;
                    }
                    input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 12px;
                        height: 12px;
                        border-radius: 50%;
                        background: #818cf8;
                        cursor: pointer;
                        transition: transform 0.1s;
                    }
                    input[type="range"]::-webkit-slider-thumb:hover {
                        transform: scale(1.2);
                    }
                    .studio-link {
                        display: inline-flex;
                        align-items: center;
                        gap: 4px;
                        font-size: 11px;
                        font-weight: 600;
                        color: #a5b4fc;
                        text-decoration: none;
                        background: rgba(99, 102, 241, 0.15);
                        padding: 6px 10px;
                        border-radius: 8px;
                        border: 1px solid rgba(99, 102, 241, 0.3);
                        transition: all 0.2s;
                        white-space: nowrap;
                    }
                    .studio-link:hover {
                        background: #6366f1;
                        color: #ffffff;
                    }
                </style>

                <div class="embed-container">
                    <iframe id="synth-iframe" allow="autoplay; fullscreen" loading="lazy" src="${this._getEmbedUrl()}"></iframe>

                    <!-- Top Status Bar -->
                    <div class="top-bar">
                        <div class="info-badge">
                            <span class="pulse-indicator"></span>
                            <div>
                                <span class="tag-label">Modular Studio DSP</span>
                                <div class="workspace-title" id="display-title">${escapeHTML(title)}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Poster / Click-to-Play Overlay (if not autoplaying or before first tap) -->
                    <div class="poster-overlay ${this.isAutoplay ? 'hidden' : ''}" id="poster-overlay">
                        <button class="play-pulse-btn" id="poster-play-btn" aria-label="Play Modular Synthesizer">
                            ▶
                        </button>
                        <div class="poster-title">${escapeHTML(title)}</div>
                        <div class="poster-subtitle">
                            <span class="badge-dot"></span>
                            Click to launch real-time browser audio
                        </div>
                    </div>

                    <!-- Bottom Controls Bar -->
                    <div class="controls-bar">
                        <div class="left-controls">
                            <button class="icon-btn" id="play-btn" aria-label="Play or Pause">
                                <span id="play-icon">▶</span>
                                <span id="play-label">Play</span>
                            </button>
                            <div class="volume-group">
                                <span>🔈</span>
                                <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="${this._volume}" aria-label="Volume">
                                <span>🔊</span>
                            </div>
                        </div>
                        <a href="${studioUrl}" target="_blank" rel="noopener" class="studio-link" id="open-studio-link">
                            <span>Open in Studio</span>
                            <span>↗</span>
                        </a>
                    </div>
                </div>
            `;

            // Attach internal listeners
            const poster = this.shadowRoot.getElementById('poster-overlay');
            if (poster) {
                poster.addEventListener('click', () => {
                    this._hasUserInteracted = true;
                    poster.classList.add('hidden');
                    this._play();
                });
            }

            const playBtn = this.shadowRoot.getElementById('play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', this._togglePlay);
            }

            const volSlider = this.shadowRoot.getElementById('volume-slider');
            if (volSlider) {
                volSlider.addEventListener('input', this._handleVolumeChange);
            }
        }

        _setupIntersectionObserver() {
            if ('IntersectionObserver' in window) {
                this._intersectionObserver = new IntersectionObserver(this._handleIntersection, {
                    threshold: 0.1
                });
                this._intersectionObserver.observe(this);
            }
        }

        _handleIntersection(entries) {
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    if (this._isPlaying) {
                        this._wasPlayingBeforeHidden = true;
                        this._pause();
                    }
                } else if (this._wasPlayingBeforeHidden) {
                    this._wasPlayingBeforeHidden = false;
                    this._play();
                }
            }
        }

        _handleMessage(event) {
            if (!event.data || typeof event.data !== 'object') return;
            const iframe = this.shadowRoot && this.shadowRoot.getElementById('synth-iframe');
            if (iframe && iframe.contentWindow && event.source === iframe.contentWindow) {
                if (event.data.type === 'modular:ready') {
                    this._isReady = true;
                    if (event.data.title) {
                        const titleEl = this.shadowRoot.getElementById('display-title');
                        if (titleEl) titleEl.textContent = event.data.title;
                    }
                    if (this.isAutoplay) {
                        this._setPlayingState(true);
                    }
                }
            }
        }

        _postToIframe(msg) {
            const iframe = this.shadowRoot && this.shadowRoot.getElementById('synth-iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage(msg, '*');
            }
        }

        _togglePlay() {
            this._hasUserInteracted = true;
            const poster = this.shadowRoot && this.shadowRoot.getElementById('poster-overlay');
            if (poster) poster.classList.add('hidden');

            if (this._isPlaying) {
                this._pause();
            } else {
                this._play();
            }
        }

        _play() {
            this._setPlayingState(true);
            this._postToIframe({ action: 'play' });
        }

        _pause() {
            this._setPlayingState(false);
            this._postToIframe({ action: 'pause' });
        }

        _setPlayingState(playing) {
            this._isPlaying = playing;
            const icon = this.shadowRoot && this.shadowRoot.getElementById('play-icon');
            const label = this.shadowRoot && this.shadowRoot.getElementById('play-label');
            if (icon && label) {
                icon.textContent = playing ? '⏸' : '▶';
                label.textContent = playing ? 'Pause' : 'Play';
            }
        }

        _handleVolumeChange(e) {
            const vol = parseFloat(e.target.value);
            this._volume = isNaN(vol) ? 0.5 : vol;
            this._postToIframe({ action: 'setVolume', value: this._volume });
        }

        _updateIframeSrc() {
            const iframe = this.shadowRoot && this.shadowRoot.getElementById('synth-iframe');
            if (iframe) {
                iframe.src = this._getEmbedUrl();
            }
            const studioLink = this.shadowRoot && this.shadowRoot.getElementById('open-studio-link');
            if (studioLink) {
                studioLink.href = this._getStudioUrl();
            }
        }

        _teardownIframe() {
            const iframe = this.shadowRoot && this.shadowRoot.getElementById('synth-iframe');
            if (iframe) {
                try {
                    this._postToIframe({ action: 'cleanup' });
                    iframe.src = 'about:blank';
                } catch (e) {}
            }
        }
    }

    function escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // Register Web Component with both primary tag and preview alias
    customElements.define('modular-synth', ModularSynthEmbed);
    if (!customElements.get('modular-preview')) {
        customElements.define('modular-preview', class extends ModularSynthEmbed {});
    }

    // Expose class on window for script/programmatic usage
    window.ModularSynthEmbed = ModularSynthEmbed;
})();
