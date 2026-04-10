---
name: Deprecated and rejected patterns
description: Things explicitly decided against in the template and why
type: feedback
originSessionId: 6c2a548b-45cb-4e02-b649-7c45845cd9dd
---
**`get_promise()`** — DEPRECATED. Use native `Promise.withResolvers()` (Chrome 119+, Firefox 121+) instead. The old pattern (returning a promise with `.resolve`/`.reject` as own properties via `Object.assign`) is commented out in `lib.js` with a migration note.

**Why:** Modern browsers all support `Promise.withResolvers()`. It's the standard, cleaner API. `get_promise()` was a workaround.

**How to apply:** If webtool or any comparison app uses `get_promise()`, note the deprecation but don't port it into template/. In template/ itself, always use `Promise.withResolvers()`.

---

**`Logger` class (console timestamping)** — DISABLED in lib.js. The idea was to prefix all console output with a local timestamp (HH:MM:SS.mmm). Problem: wrapping console methods converts object arguments to strings first, losing the interactive expandable object display in devtools (showing `[object Object]` instead). Needs a better approach before enabling.

**How to apply:** Don't re-enable the Logger class as-is. If the user asks for timestamped logs, the issue is the string-coercion of objects — any solution must preserve native console object rendering.

---

**CDN-linked dependencies** — Rejected in template. All deps (Vue, LESS, Font Awesome) are vendored in `www/`. CDN links cause 404s during offline/local dev and add external dependencies. Some comparison apps (stee, tmssim-rs) use CDNs — this is considered a weakness to fix when porting them.

---

**Base64 encoding of binary over WebSocket** — Considered and rejected. The current approach (binary ArrayBuffer followed by JSON metadata) is preferred. Base64 has no advantages for this use case and adds encoding overhead.
