# BREA — D‑ID ↔ Vapi WebRTC Bridge (Next.js + Vercel)

This app provides a single HTTP endpoint that a D‑ID Agents embed widget can POST a WebRTC SDP offer to.
The endpoint creates a Vapi `webCall` and returns the WebRTC SDP answer back to D‑ID.

## Endpoint

- `POST /api/did/webrtc/offer`
  - Request: `{ "type": "offer", "sdp": "v=0..." }`
  - Response: `{ "type": "answer", "sdp": "v=0..." }`

Configure your D‑ID widget "Custom LLM" / external provider mode to use:

`https://YOUR_VERCEL_DOMAIN/api/did/webrtc/offer`

## Environment Variables (Vercel)

Required:
- `VAPI_PRIVATE_KEY` (server-side only)
- `VAPI_ASSISTANT_ID` (your assistant id)

Recommended:
- `ALLOWED_ORIGINS` (comma-separated list like `https://example.com,https://www.example.com`)
- `LOG_LEVEL` (`debug` | `info` | `warn` | `error`) default: `info`

## Notes

- This bridge does NOT call Gemini directly. Vapi handles the model internally based on the assistant configuration.
- If `POST https://api.vapi.ai/call` rejects `type: "webCall"`, your Vapi org likely does not have Web Calls enabled yet.
