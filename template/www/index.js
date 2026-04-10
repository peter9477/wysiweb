import { Connector, sleep, make_uuid, toHex, fromHex, DEV, NO_RETRY } from './js/lib.js';

// ---------------------------------------------------------------------------
// App configuration — edit these for each new project

const APP_NAME = 'MyApp';

// WS_PATH: null = auto-derive from page URL (path + .ws suffix, e.g. /myapp.ws)
//          or set explicitly, e.g. '/.ws' or '/myapp.ws'
const WS_PATH = null;

// ---------------------------------------------------------------------------

function ws_url() {
    if (WS_PATH) return location.href.replace(/^http(s?:\/\/[^/]*).*/, 'ws$1' + WS_PATH);
    return location.href.replace(/http(.*?:\/\/[^/]*)(\/[^/]*)(.*)/, 'ws$1$2.ws');
}

let client_uuid;
try   { client_uuid = localStorage.app_uuid || (localStorage.app_uuid = make_uuid()); }
catch { client_uuid = make_uuid(); }

// ---------------------------------------------------------------------------
// Vue app

const app = Vue.createApp({
    data() {
        return {
            // Connection state
            connected: false,
            connState: 'connecting',    // connecting | connected | reconnecting | disconnected
            updateAvailable: false,

            // Server-provided metadata
            version: '',
            hostname: '',

            // User identity
            uuid: client_uuid,

            // Toasts — managed by this.toast(); don't edit directly
            toasts: [],

            // --- App-specific state below this line ---

            // Template flag — lets v-if="dev" show dev-only UI elements
            dev: DEV,

            // Ping test — remove when building a real app
            pingText:   '',
            pongResult: null,

        };
    },

    mounted() {
        // Dark mode: respect saved preference, then OS preference, default light.
        const savedDark = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (savedDark === 'true' || (savedDark === null && prefersDark))
            document.documentElement.classList.add('dark');

        // Connector — Vue instance is the owner; _msg_* methods below receive calls directly.
        this.conn = new Connector(this, { noRetry: NO_RETRY, giveUpMinutes: 1 });
        this.conn.addEventListener('state', e => {
            this.connState = e.state;
            this.connected = (e.state === 'connected');
        });
        this.conn.open(ws_url());

        // Debug namespace — always available in the browser console.
        // z.emit('ping') to send a message, z.state() for a data snapshot, etc.
        window.z = {
            vm:    this,
            app,
            conn:  this.conn,
            emit:   (msg, data) => this.conn.emit(msg, data),
            state:  () => JSON.parse(JSON.stringify(this.$data)),
            toast:  (message, level, ms) => this.toast(message, level, ms),
            reload: () => location.reload(),
        };

        if (DEV) {
            less.env = 'development';
            less.poll = 2000;
            less.watch();
            console.log('dev mode — LESS watch active, z namespace:', Object.keys(window.z));
        }
    },

    methods: {

        // --- Server → client messages (Connector dispatches these) ----------

        // Backend should send {_t:'meta', hash, version, hostname} on connect.
        _msg_meta(msg) {
            if (msg.version)  this.version  = msg.version;
            if (msg.hostname) this.hostname = msg.hostname;

            // Auto-reload when frontend source changes.
            // In dev mode: reload immediately (avoids stale cache during dev).
            // In production: show a banner so the user can choose when to reload.
            if (msg.hash) {
                const key = 'web_hash';
                const old = sessionStorage[key] || localStorage[key] || null;
                sessionStorage[key] = localStorage[key] = msg.hash;
                if (old && old !== msg.hash) {
                    if (DEV) location.reload();
                    else this.updateAvailable = true;
                }
            }
        },

        // Generic full-state update: copies all non-_ keys onto the Vue instance.
        _msg_state(msg) {
            for (const key in msg)
                if (key[0] !== '_') this[key] = msg[key];
        },

        // --- Toast notifications -------------------------------------------

        // Show a transient notification.
        // level: 'info' (default) | 'success' | 'warning' | 'danger'
        // ms:    display duration in milliseconds (default 4000)
        toast(message, level = 'info', ms = 8000) {
            const id = make_uuid([2]);
            this.toasts.push({ id, message, level, fading: false });

            // After ms, start the CSS fade-out, then remove from the list.
            setTimeout(() => {
                const t = this.toasts.find(t => t.id === id);
                if (t) t.fading = true;
            }, ms);
            setTimeout(() => {
                this.toasts = this.toasts.filter(t => t.id !== id);
            }, ms + 900);   // 900ms matches the CSS transition duration
        },

        // --- UI event handlers ----------------------------------------------

        onReconnect()  { this.conn.open(); },
        onReload()     { location.reload(); },
        toggleDark() {
            const dark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', dark);
        },

        // --- Add app-specific handlers below --------------------------------

        // Ping test — remove when building a real app
        _msg_pong(msg) {
            this.pongResult = {
                text: msg.text,
                ts:   new Date(msg.ts * 1000).toLocaleTimeString(),
            };
            this.toast(`Pong: "${msg.text}"`, 'success');
        },
        onPing() {
            this.conn.emit('ping', { text: this.pingText || 'hello' });
        },

    },

    computed: {
        // Add computed properties here
    },
});

app.config.warnHandler = (msg) => console.warn('Vue:', msg);

// Register components here:
// app.component('my-widget', { template: '#my-widget', props: { ... } });

app.mount('#vue-root');
