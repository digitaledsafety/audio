/**
 * MultiplayerSession.js - Module for P2P multiplayer sessions, lobby discovery, and real-time chat.
 * Designed for web audio apps and collaborative tools.
 */

class SessionChat {
    constructor(sessionConnection) {
        this.sessionConnection = sessionConnection;
        this.messages = [];
        this.listeners = new Map();

        if (this.sessionConnection) {
            this.sessionConnection.on('data-received', (msg) => {
                if (msg && msg.type === 'chat') {
                    this._addMessage(msg.data);
                }
            });
            this.sessionConnection.on('connection-opened', (peerId) => {
                this._addSystemMessage(`User ${peerId.substring(0, 8)} joined the session.`);
            });
            this.sessionConnection.on('connection-closed', (peerId) => {
                this._addSystemMessage(`User ${peerId.substring(0, 8)} left the session.`);
            });
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(...args));
        }
    }

    sendMessage(text, senderName = 'User') {
        if (!text || !text.trim()) return;

        const chatPayload = {
            senderId: this.sessionConnection ? this.sessionConnection.getPeerId() : 'Local',
            senderName,
            text: text.trim(),
            timestamp: Date.now()
        };

        if (this.sessionConnection && this.sessionConnection.isConnected()) {
            this.sessionConnection.broadcast({
                type: 'chat',
                data: chatPayload
            });
        }

        this._addMessage(chatPayload);
    }

    getMessages() {
        return [...this.messages];
    }

    _addMessage(msgPayload) {
        this.messages.push(msgPayload);
        this.emit('message', msgPayload);
        this.emit('messages-updated', this.messages);
    }

    _addSystemMessage(text) {
        const sysPayload = {
            senderId: 'system',
            senderName: 'System',
            text,
            isSystem: true,
            timestamp: Date.now()
        };
        this.messages.push(sysPayload);
        this.emit('message', sysPayload);
        this.emit('messages-updated', this.messages);
    }
}

class SessionConnection {
    constructor(options = {}) {
        this.peer = null;
        this.hostId = null;
        this.connections = new Map(); // key: peerId, value: DataConnection
        this.isHost = false;
        this.eventListeners = new Map();
        this._peerIdReady = false;
        this._pendingConnection = null;
        this._pendingHosting = false;
        this.PeerClass = options.PeerClass || (typeof window !== 'undefined' ? window.Peer : null);
    }

    initialize() {
        try {
            const PeerConstructor = this.PeerClass || (typeof window !== 'undefined' ? window.Peer : null);
            if (!PeerConstructor) {
                console.warn('PeerJS library is not available on window.Peer');
                return;
            }

            this.peer = new PeerConstructor();
            this.peer.on('open', this._handlePeerOpen.bind(this));
            this.peer.on('connection', this._handleConnection.bind(this));
            this.peer.on('error', this._handleError.bind(this));

            setTimeout(() => {
                if (!this._peerIdReady) {
                    const fallbackId = 'local-' + Math.random().toString(36).substring(2, 9);
                    if (this.peer) this.peer.id = fallbackId;
                    this._handlePeerOpen(fallbackId);
                }
            }, 2000);
        } catch (e) {
            this._handleError(e);
        }
    }

    startHosting() {
        this.isHost = true;
        this.hostId = this.getPeerId();
        if (this.hostId) {
            this.emit('host-started', this.hostId);
        } else {
            this._pendingHosting = true;
        }
    }

    connectTo(hostId) {
        if (!this._peerIdReady) {
            this._pendingConnection = hostId;
            return;
        }

        if (this.connections.has(hostId)) {
            return;
        }

        const PeerConstructor = this.PeerClass || (typeof window !== 'undefined' ? window.Peer : null);
        if (!this.peer && PeerConstructor) {
            this.initialize();
        }

        if (this.peer) {
            const conn = this.peer.connect(hostId, { reliable: true });
            this._setupConnection(conn);
            this.hostId = hostId;
            this.isHost = false;
        }
    }

    disconnect() {
        for (const conn of this.connections.values()) {
            conn.close();
        }
        this.connections.clear();
        this.isHost = false;
        this.hostId = null;
        this.emit('connections-updated', []);
        this.emit('disconnected');
    }

    broadcast(data) {
        if (this.isHost) {
            this._broadcastToOthers(this.getPeerId(), data);
        } else if (this.hostId && this.connections.has(this.hostId)) {
            this.connections.get(this.hostId).send(JSON.stringify(data));
        }
    }

    getPeerId() {
        return this.peer ? this.peer.id : null;
    }

    getConnectedPeers() {
        return Array.from(this.connections.keys());
    }

    isConnected() {
        return this.connections.size > 0 || this.isHost;
    }

    on(eventName, listener) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(listener);
    }

    emit(eventName, ...args) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(listener => listener(...args));
        }
    }

    _handlePeerOpen(id) {
        this._peerIdReady = true;
        this.emit('peer-id-ready', id);

        if ((this.isHost || this._pendingHosting) && id) {
            this.isHost = true;
            this.hostId = id;
            this._pendingHosting = false;
            this.emit('host-started', id);
        }

        if (this._pendingConnection) {
            this.connectTo(this._pendingConnection);
            this._pendingConnection = null;
        }
    }

    _handleConnection(conn) {
        this._setupConnection(conn);
    }

    _handleError(err) {
        this.emit('error', err);
    }

    _setupConnection(conn) {
        conn.on('open', () => this._handleOpen(conn));
        conn.on('data', (data) => this._handleData(conn, data));
        conn.on('close', () => this._handleClose(conn));
        conn.on('error', (err) => this._handleConnError(conn, err));
    }

    _handleOpen(conn) {
        this.connections.set(conn.peer, conn);
        this.emit('connection-opened', conn.peer);
        this.emit('connections-updated', Array.from(this.connections.values()));
    }

    _handleData(conn, data) {
        try {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            if (this.isHost) {
                this._broadcastToOthers(conn.peer, parsedData);
            }
            this.emit('data-received', parsedData);
        } catch (e) {
            console.error("Failed to parse incoming data:", e);
        }
    }

    _handleClose(conn) {
        this.connections.delete(conn.peer);
        this.emit('connection-closed', conn.peer);
        this.emit('connections-updated', Array.from(this.connections.values()));

        if (conn.peer === this.hostId && !this.isHost) {
            this.disconnect();
        }
    }

    _handleConnError(conn, err) {
        this.emit('error', err);
    }

    _broadcastToOthers(senderId, data) {
        const payload = JSON.stringify(data);
        for (const [peerId, conn] of this.connections.entries()) {
            if (peerId !== senderId) {
                conn.send(payload);
            }
        }
    }
}

class SessionLobby {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'audio_active_sessions_v1';
        this.listeners = new Map();
        this.announcementInterval = null;
        this.pollInterval = null;
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    emit(event, ...args) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(...args));
        }
    }

    startBroadcastingSession(sessionInfo) {
        const announce = () => {
            try {
                const existingSessions = this.getActiveSessions();
                const sessionData = {
                    id: sessionInfo.id,
                    title: sessionInfo.title || `Session ${sessionInfo.id.substring(0, 6)}`,
                    peerCount: sessionInfo.peerCount || 1,
                    startTime: sessionInfo.startTime || Date.now(),
                    lastSeen: Date.now()
                };

                const updatedSessions = existingSessions.filter(s => s.id !== sessionInfo.id && (Math.abs(Date.now() - s.lastSeen) < 3600000));
                updatedSessions.push(sessionData);

                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(this.storageKey, JSON.stringify(updatedSessions));
                }
            } catch (e) {
                console.warn('Failed to announce session in lobby:', e);
            }
        };

        announce();
        this.announcementInterval = setInterval(announce, 10000);
    }

    stopBroadcastingSession(sessionId) {
        if (this.announcementInterval) {
            clearInterval(this.announcementInterval);
            this.announcementInterval = null;
        }
        try {
            const existingSessions = this.getActiveSessions();
            const updatedSessions = existingSessions.filter(s => s.id !== sessionId);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.storageKey, JSON.stringify(updatedSessions));
            }
        } catch (e) {
            console.warn('Failed to remove session from lobby:', e);
        }
    }

    getActiveSessions() {
        try {
            if (typeof localStorage === 'undefined') return [];
            const raw = localStorage.getItem(this.storageKey);
            if (!raw) return [];
            const sessions = JSON.parse(raw);
            const now = Date.now();
            return sessions.filter(s => s.id && (Math.abs(now - s.lastSeen) < 3600000));
        } catch (e) {
            return [];
        }
    }

    startListening() {
        const update = () => {
            const sessions = this.getActiveSessions();
            this.emit('sessions-updated', sessions);
        };
        update();
        this.pollInterval = setInterval(update, 3000);

        if (typeof window !== 'undefined') {
            window.addEventListener('storage', (e) => {
                if (e.key === this.storageKey) {
                    update();
                }
            });
        }
    }

    stopListening() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}

if (typeof window !== 'undefined') {
    window.SessionChat = SessionChat;
    window.SessionConnection = SessionConnection;
    window.SessionLobby = SessionLobby;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SessionChat, SessionConnection, SessionLobby };
}
