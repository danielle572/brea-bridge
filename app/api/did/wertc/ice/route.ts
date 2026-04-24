import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ status: "ice-candidate-received", name: "Brea Bridge" });
}
