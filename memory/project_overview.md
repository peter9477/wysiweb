---
name: Project overview
description: What wysiweb is, its comparison apps, the template's purpose and constraints
type: project
originSessionId: 6c2a548b-45cb-4e02-b649-7c45845cd9dd
---
This repo holds several existing internal web apps side-by-side as comparison references, with `template/` as the synthesized best-of output.

**Why:** The goal is a lean, fast-to-copy starting point for new internal tool UIs. Template growth is only justified for general-purpose improvements — app-specific features don't belong here.

**How to apply:** When asked to add or change something, ask: "Would this be useful in most new projects, or is it app-specific?" If app-specific, don't do it in template/.

Stack chosen: Vue 3 (Options API), LESS (in-browser compilation via vendored less.min.js), WebSocket via custom Connector class. Zero build step — no npm, no bundler, no transpilation. All deps vendored.

The template was synthesized from several real internal apps (signsim, stee, tcw-admin, tmssim-rs, trimssim, voip, webtool). Those sibling folders were used for comparison only and will be removed. Their stacks ranged from Vue 2 + CDN deps (stee, oldest) to Rust/WASM + Web Bluetooth (webtool, most complex). The template distils the common good patterns.
