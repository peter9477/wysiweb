---
name: Template design decisions
description: Key technical choices made during the template design sessions (Apr 2026)
type: project
originSessionId: 6c2a548b-45cb-4e02-b649-7c45845cd9dd
---
These decisions were made in a multi-session design conversation, not just discovered by reading the code.

**LESS over plain CSS**: Chosen because LESS functions (`lighten()`, `darken()`, `desaturate()`) allow the entire palette to be derived from 4 seed variables (`@hue`, `@primary`, `@success`, `@danger`). Plain CSS lacks colour manipulation functions. Dark mode is layered on top via CSS custom properties (`var(--bg-page)` etc.) so it flips at runtime without LESS recompilation.

**Options API (not Composition API)**: Composition API's `<script setup>` requires a compiler. Options API works naturally with the no-build, `template: '#id'` pattern. Only `data()` return values become reactive — other properties are not, which matters for performance.

**`_msg_TYPE` dispatch convention**: Connector calls `owner._msg_TYPE(msg)` where TYPE comes from the `_t` field of every JSON envelope `{ "_t": "...", ...payload }`. This avoids a manual switch or registry — just define a method. Underscore prefix prevents collision with Vue lifecycle hooks.

**Binary message pairing**: Binary arrives first, JSON metadata follows; Connector stitches `_binary` onto the JSON message object. Immune to race conditions because a single async loop processes the message stream sequentially.

**Reconnection**: Exponential backoff `100 * 3^n` capped at 15s, gives up after 15 minutes. If connected > 5s then drops, attempt counter resets (fast retries again) but the give-up clock does NOT reset (prevents infinite cycling on flaky connections).

**`#dev` and `#noretry` URL hash flags**: `#dev` enables LESS watch, hiliter, auto-reload on hash change. `#noretry` makes one WS attempt then gives up cleanly — avoids noisy console errors when running frontend-only without a backend. Can be combined with `&`: `#dev&noretry`.

**`window.z` debug namespace**: Single global namespace (not many `window.xxx` aliases) for console debugging. Always present, no conditional. Contains: `z.state()`, `z.emit()`, `z.toast()`, `z.conn`, `z.vm`.

**Source hash / auto-reload**: Backend sends a `hash` in the `meta` message. On change: `#dev` → immediate reload; production → "Update available" banner with click-to-reload. Stored in both `sessionStorage` and `localStorage`.

**Toast duration**: 8s display + 1.8s fade (doubled from initial implementation). Level 'info' is the default.

**Vue components**: Defined via `<script type="text/html" id="...">` blocks at the bottom of index.html, registered with `app.component()`. No SFC files, no build step.

**Font Awesome**: FA 6.x vendored (CSS + woff2 only). FA 7 dropped LESS in favour of Sass — we noted this but it's not a problem since we only use the compiled CSS, not the FA source.

**Lib.js split (not monolith)**: `lib.js` holds Connector + shared utilities. Not merged into index.js because it's "rarely modified" and would add noise to the app-specific file. But also don't want a profusion of .js files — lib.js is the single stable module boundary.

**Request-response and auto-sync watchers**: Documented as Future Ideas in README.md but not implemented — we haven't missed them enough in practice.
