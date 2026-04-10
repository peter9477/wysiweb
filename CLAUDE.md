# CLAUDE.md

## Purpose

`template/` is a lean, general-purpose starting point for internal tool UIs — synthesized from several real apps. Only add things here if they're useful across most projects; keep it easy to copy and strip down.

## Template stack

Vue 3 (Options API) + LESS (in-browser) + WebSocket, all vendored, zero build step. See `template/README.md` for full docs.

## Key files in template

| File | Role |
|------|------|
| `www/index.html` | HTML shell + Vue markup |
| `www/index.js` | App entry: data, message handlers, UI |
| `www/js/lib.js` | `Connector` class + shared utilities (rarely touched) |
| `www/css/const.less` | Colour seed variables + derived palette |
| `www/css/style.less` | Layout framework + helpers |
| `test_server.py` | Minimal aiohttp backend for testing |

## Memory / design log

Extended context (design decisions, rationale, deprecated patterns) lives in `memory/`. See `memory/MEMORY.md` for the index.

## Working conventions

- Only add things here if useful across most projects — no app-specific features.
- No npm, no bundler, no transpilation — deliberate constraint.
- Keep vendored libs reasonably current; don't chase bleeding-edge.
- Primary targets: modern Chrome/Firefox including Android. iOS/Safari not actively supported.
- Prefer `Promise.withResolvers()` over `get_promise()`.
- User is experienced — be direct, skip basics, no preamble.
- Keep docs and comments lean; explain only the non-obvious. Apply this to CLAUDE.md itself.
- Record design decisions (deprecations, why-X-over-Y) in `memory/` for future reference.
