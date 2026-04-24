import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { candidate, sdpMid, sdpMLineIndex, streamId, sessionId } = await request.json();

    const response = await fetch(`https://api.d-id.com/talks/streams/${streamId}/ice`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ice_candidate: candidate,
        sdp_mid: sdpMid,
        sdp_mline_index: sdpMLineIndex,
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "ICE failed", details: error }, { status: 500 });
  }
}
