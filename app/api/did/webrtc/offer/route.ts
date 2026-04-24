import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { sdp, streamId, sessionId } = await request.json();

    // This reaches out to D-ID to start the video stream
    const response = await fetch(`https://api.d-id.com/talks/streams/${streamId}/sdp`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.DID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        answer: sdp,
        session_id: sessionId,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Offer failed", details: error }, { status: 500 });
  }
}
