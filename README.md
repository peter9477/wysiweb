# Web App Template

A lean starting point for internal tool UIs: Vue 3 + LESS + WebSocket, no build step.

## Quick Start

1. Copy the `template/` directory and rename it.
2. In `www/index.js`: set `APP_NAME` and `WS_PATH`.
3. In `www/index.html`: update `<title>APP_NAME</title>` to match.
4. Change `@hue` in `www/css/const.less` to shift the colour palette.
5. Serve `www/` with any static HTTP server; point a backend at the same host.

```
python3 -m http.server 8080    # then open http://localhost:8080
```

For a fuller test with a real WebSocket backend, use `template/test_server.py`:

```
pip install aiohttp
cd template
python3 test_server.py    # serves www/ at /app/ and WebSocket at ws://localhost:8080/app.ws
```

Open `http://localhost:8080/app/`. The server sends a `meta` message on connect
and responds to `ping` with a `pong`.

---

## File Overview

| File | Purpose |
|------|---------|
| `www/index.html` | HTML shell + Vue template markup |
| `www/index.js` | App entry point — data model, message handlers, UI handlers |
| `www/js/lib.js` | Connector + shared utilities (rarely modified) |
| `www/css/const.less` | Colour system — seed values and derived palette |
| `www/css/style.less` | Layout framework — structure, helpers, utilities |
| `www/css/reset.css` | CSS reset (vendored) |
| `www/css/all.min.css` | Font Awesome icons (vendored) |
| `www/js/vue.global.prod.js` | Vue 3 (vendored) |
| `www/js/less.min.js` | LESS compiler for in-browser compilation (vendored) |
| `www/webfonts/` | Font Awesome webfont files |

---

## Colour Theming

Edit the four seed values at the top of `const.less`:

```less
@hue:     210;                   // change this — shifts the whole palette
@primary: hsl(@hue, 55%, 45%);  // brand/action colour
@neutral: hsl(@hue, 5%, 40%);   // base grey (picks up a tint from @hue)
@success: hsl(120, 40%, 45%);   // positive/connected states
@danger:  hsl(  0, 55%, 50%);   // errors/disconnected
```

Everything else (backgrounds, text, borders, button colours) is derived automatically
via LESS functions. Leave the derived section alone unless you need to fine-tune.

---

## Dev Mode

Append `#dev` to the URL (e.g. `http://localhost:8080/#dev`) to enable:

- **LESS watch mode** — styles auto-reload when `.less` files change (polls every 2s).
- **Hiliter** — a small red dot appears in the top-left corner; click it to toggle
  dashed borders on every element for layout debugging.
- **Auto-reload on update** — source hash changes trigger an immediate page reload
  rather than showing the banner.

In production (no `#dev`), source hash changes show an "Update available" banner
instead of reloading automatically.

---

## Debug Console (`window.z`)

The `z` namespace is always available in the browser console:

| Expression | Effect |
|-----------|--------|
| `z.state()` | JSON snapshot of all reactive Vue data |
| `z.emit('ping')` | Send a message to the backend |
| `z.emit('set', {key:'val'})` | Send a message with data |
| `z.conn.state` | Current Connector state string |
| `z.vm.connected` | True if WebSocket is open |
| `Object.keys(z)` | List everything available |

---

## Backend Protocol

On connect, send a `meta` message:
```json
{ "_t": "meta", "version": "1.2.3", "hostname": "myhost", "hash": "abc123" }
```

- `version` — displayed in the header.
- `hostname` — displayed on the right side of the header.
- `hash` — a hash of the frontend source files. When this changes the client
  reloads to pick up updated assets. Generate it however suits your backend;
  a short hash of `index.html` + `index.js` file contents works well.

All subsequent messages follow the same envelope:
```json
{ "_t": "message_type", ...payload }
```
Add a handler `_msg_TYPE(msg)` in the `methods` section of `index.js`.

---

## Adding Vue Components

Define the template in a `<script type="text/html">` block at the bottom of
`index.html`, then register it in `index.js`:

```html
<!-- index.html (before closing </body>) -->
<script type="text/html" id="my-widget">
<div class="my-widget">
    <span>{{label}}</span>
    <slot></slot>
</div>
</script>
```

```js
// index.js (after Vue.createApp, before app.mount)
app.component('my-widget', {
    template: '#my-widget',
    props: { label: String },
});
```

---

## Mobile

The flexbox layout works on small screens without modification. If your app
needs pinch-zoom, remove `maximum-scale=1.0, user-scalable=no` from the
`<meta name="viewport">` tag in `index.html`.

iOS/Safari quirks are not actively worked around; modern Chrome/Firefox on
Android is the primary mobile target.

---

## Reconnection Behaviour

The Connector retries automatically with exponential backoff:

| Attempt | Delay  |
|---------|--------|
| 1       | 100 ms |
| 2       | 300 ms |
| 3       | 900 ms |
| 4       | 2.7 s  |
| 5       | 8.1 s  |
| 6+      | 15 s   |

After 15 minutes of failed attempts the Connector gives up and the header shows
a **Reconnect** button. To retry forever, pass `{ giveUpMinutes: Infinity }` to
the `Connector` constructor in `mounted()`.

If a connection drops after being stable for more than 5 seconds, the attempt
counter resets (fast retries again). Short-lived connections continue the backoff
to prevent rapid-reconnect thrashing.

---

## Toast Notifications

Call `this.toast()` from any method, or `z.toast()` from the browser console:

```js
this.toast('Settings saved');                    // info (default), 8s
this.toast('Upload failed', 'danger');           // red
this.toast('Rebooting…', 'warning', 16000);      // orange, 16s
this.toast('Connected', 'success', 4000);        // green, 4s
```

Levels: `info` · `success` · `warning` · `danger`

Toasts appear bottom-right, stack upward, and fade out automatically. They
don't affect layout and don't block interaction.

---

## Dark Mode

A dark mode toggle (half-circle icon) sits in the header. The preference
persists in `localStorage`. On first visit, the OS `prefers-color-scheme`
setting is respected.

To toggle programmatically: `z.vm.toggleDark()` or `z.emit` is not needed —
just call `toggleDark()` from any handler.

The colour system uses CSS custom properties (`var(--bg-page)` etc.) so the
switch happens instantly at runtime without recompiling LESS. Only
background/text/border colours flip; semantic colours (`@primary`, `@success`,
`@danger`, `@warning`) stay the same in both modes.

---

## Future Ideas

These patterns aren't implemented in the template but are straightforward to add:

### Request-Response over WebSocket

For "send a command, await the result" without manual handler wiring. Add a
`request()` method to Connector that sends a correlation ID (`_rid`) and
returns a Promise that resolves when a response with the matching `_rid` arrives:

```js
// Client
const result = await this.conn.request('get_status', { id: 42 });

// Server sends back: { _t: 'get_status', _rid: '<same id>', ...result }
```

Implementation sketch (~20 lines): a `Map` of pending `_rid` → `{resolve, reject}`,
populated in `request()` and drained in `_dispatch()` before normal handler
lookup. Server just echoes back the `_rid` field.

### Auto-Sync Watchers

For control-panel UIs where most inputs map directly to backend state, a helper
can generate Vue watchers that automatically emit changes:

```js
// Instead of writing a watcher for each property:
watch: {
    ...autoSync(this.conn, ['brightness', 'volume', 'mode']),
}
// Each generates: (val) => this.conn.emit('set', { key: 'brightness', value: val })
```

`autoSync(conn, keys)` returns a plain object of `{ [key]: handler }` suitable
for spreading into `watch:`.
