export default function Page() {
  return (
    <main style={{ fontFamily: "ui-sans-serif", padding: 24, lineHeight: 1.5 }}>
      <h1>BREA D‑ID ↔ Vapi Bridge</h1>
      <p>
        WebRTC offer endpoint:
      </p>
      <pre style={{ padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
        POST /api/did/webrtc/offer
      </pre>
      <p>
        Health check:
      </p>
      <pre style={{ padding: 12, background: "#f5f5f5", borderRadius: 8 }}>
        GET /api/health
      </pre>
    </main>
  );
}
