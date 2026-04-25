'use client';

import { VapiWidget } from "@vapi-ai/client-sdk-react";

export default function Page() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      <VapiWidget
        publicKey="5a37ca99-e891-4c52-943a-feb27293dc64"
        assistantId="7cb318a5-62e4-4c13-9c53-1af4cdf08848"
        displayMode="compact" // This ensures she sits in the corner first!
      />
    </main>
  );
}
