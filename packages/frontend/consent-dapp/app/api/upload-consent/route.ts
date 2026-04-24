import { NextRequest, NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nessun file" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Solo PDF" }, { status: 400 });
    }
    if (file.size > 10_000_000) {
      return NextResponse.json(
        { error: "File troppo grande (max 10MB)" },
        { status: 400 }
      );
    }

    // Upload
    const upload = await pinata.upload.public.file(file);

    // Ritorna solo il CID
    return NextResponse.json({ cid: upload.cid });

  } catch (e) {
    console.error("Pinata error:", e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}