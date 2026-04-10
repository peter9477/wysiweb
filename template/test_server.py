#!/usr/bin/env python3
"""
Minimal test backend for the web template.

Serves www/ as static files and provides a WebSocket endpoint.

Usage:
    pip install aiohttp
    python3 test_server.py
    open http://localhost:8080/app/
"""

import asyncio
import json
import time
import socket
from pathlib import Path

from aiohttp import web

ROOT = Path(__file__).parent / 'www'
VERSION = '0.1.0'
HASH = 'abc124'

# ---------------------------------------------------------------------------

async def ws_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    print(f'[ws] connected from {request.remote}')

    # Send metadata on connect
    await ws.send_json({
        '_t':      'meta',
        'version': VERSION,
        'hostname': socket.gethostname(),
        'hash':    HASH,
    })

    async for msg in ws:
        if msg.type == web.WSMsgType.TEXT:
            try:
                data = json.loads(msg.data)
            except json.JSONDecodeError:
                print(f'[ws] bad JSON: {msg.data!r}')
                continue

            t = data.get('_t')
            print(f'[ws] recv: {data}')

            if t == 'ping':
                reply = {
                    '_t':  'pong',
                    'text': data.get('text', ''),
                    'ts':   time.time(),
                }
                await ws.send_json(reply)
                print(f'[ws] sent: {reply}')
            else:
                print(f'[ws] unhandled message type: {t!r}')

        elif msg.type == web.WSMsgType.ERROR:
            print(f'[ws] error: {ws.exception()}')

    print('[ws] disconnected')
    return ws

# ---------------------------------------------------------------------------

def main():
    app = web.Application()
    app.router.add_get('/app.ws', ws_handler)
    app.router.add_static('/app/', ROOT, show_index=True)

    print(f'Serving on http://localhost:8080/app/')
    print(f'WebSocket at ws://localhost:8080/app.ws')
    web.run_app(app, host='localhost', port=8080, print=None)

if __name__ == '__main__':
    main()
