import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Simple CORS:
 * - If ALLOWED_ORIGINS is unset, we allow the request origin (easy for initial testing).
 * - If ALLOWED_ORIGINS is set, we only allow those origins.
 */
function buildCorsHeaders(origin: string | null) {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let allowOrigin = "*";

  if (origin) {
    if (allowedOrigins.length === 0) {
      allowOrigin = origin;
    } else {
      allowOrigin = allowedOrigins.includes(origin) ? origin : "null";
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
}

function log(level: "debug" | "info" | "warn" | "error", ...args: any[]) {
  const configured = (process.env.LOG_LEVEL || "info").toLowerCase();
  const order = { debug: 10, info: 20, warn: 30, error: 40 } as const;
  if ((order as any)[level] >= (order as any)[configured]) {
    console[level](...args);
  }
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: buildCorsHeaders(origin) });
}

/**
 * D‑ID -> POST here with SDP offer:
 *   { "type": "offer", "sdp": "v=0..." }
 *
 * We call Vapi to create a WebRTC webCall and return the SDP answer:
 *   { "type": "answer", "sdp": "v=0..." }
 */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
  const VAPI_ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID;

  if (!VAPI_PRIVATE_KEY) {
    return NextResponse.json({ error: "Missing VAPI_PRIVATE_KEY" }, { status: 500, headers: corsHeaders });
  }
  if (!VAPI_ASSISTANT_ID) {
    return NextResponse.json({ error: "Missing VAPI_ASSISTANT_ID" }, { status: 500, headers: corsHeaders });
  }

  let offer: any;
  try {
    offer = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  if (!offer?.type || !offer?.sdp) {
    return NextResponse.json(
      { error: "Expected WebRTC offer payload: { type, sdp }" },
      { status: 400, headers: corsHeaders }
    );
  }

  if (offer.type !== "offer") {
    return NextResponse.json(
      { error: `Expected type="offer", got "${offer.type}"` },
      { status: 400, headers: corsHeaders }
    );
  }

  /**
   * Vapi call creation payload.
   *
   * Field names for the offer/answer may vary slightly by org/version.
   * We include two common patterns; Vapi should ignore unknown fields.
   */
  const vapiPayload: any = {
    type: "webCall",
    assistantId: VAPI_ASSISTANT_ID,

    // Pattern A
    webRtcOffer: offer,

    // Pattern B
    transport: {
      type: "webrtc",
      offer
    }
  };

  log("info", "[/api/did/webrtc/offer] Creating Vapi webCall for assistant:", VAPI_ASSISTANT_ID);

  const resp = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_PRIVATE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(vapiPayload)
  });

  const vapiData = await resp.json().catch(() => ({}));

  if (!resp.ok) {
    log("error", "[/api/did/webrtc/offer] Vapi error:", resp.status, vapiData);
    return NextResponse.json(
      {
        error: "Vapi create webCall failed",
        status: resp.status,
        vapi: vapiData
      },
      { status: 502, headers: corsHeaders }
    );
  }

  const answer =
    (vapiData as any).webRtcAnswer ||
    (vapiData as any).transport?.answer ||
    (vapiData as any).answer ||
    (vapiData as any).webrtc?.answer;

  if (!answer?.type || !answer?.sdp) {
    log("error", "[/api/did/webrtc/offer] No SDP answer found in Vapi response:", vapiData);
    return NextResponse.json(
      { error: "No WebRTC answer found in Vapi response", vapi: vapiData },
      { status: 502, headers: corsHeaders }
    );
  }

  log("info", "[/api/did/webrtc/offer] Returning SDP answer to caller.");
  return NextResponse.json(answer, { status: 200, headers: corsHeaders });
}
