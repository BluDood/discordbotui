# Discord UI for bots

This project is a super simple web interface + proxy to have a visual UI for exploring your bot's guilds and channels.

## Usage

Simply click `Login` in the bottom left, enter your bot's token, and you can start navigating between servers and channels.

You are also able to see and send messages. There are no live updates or message history, press the refresh icon in the top right to refresh messages.

## Proxy

The proxy is required to bypass CORS issues, it can be run using Deno:

```bash
deno serve --allow-net --port 1337 scripts/proxy.ts
```
