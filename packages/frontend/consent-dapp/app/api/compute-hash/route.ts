// packages/frontend/src/app/api/compute-hash/route.ts
import { NextRequest, NextResponse } from "next/server";
import { keccak256, toBytes } from "viem";
import { pinata } from "@/utils/config";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nessun file" }, { status: 400 });
    }

    // Carica il file su IPFS per ottenere il CID deterministico
    const upload = await pinata.upload.public.file(file);
    const cid = upload.cid;

    // Calcola il documentHash nello stesso modo del frontend paziente
    const hash = keccak256(toBytes(cid));

    return NextResponse.json({ hash, cid });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
