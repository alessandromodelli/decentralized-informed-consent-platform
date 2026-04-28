// src/app/api/rpc-logs/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Usa il nodo pubblico Polygon — nessun limite su eth_getLogs
  const res = await fetch("https://rpc-amoy.polygon.technology", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data);
}