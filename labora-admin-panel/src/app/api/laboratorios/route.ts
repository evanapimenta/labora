import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.toString();
    const data = await apiFetch(`/api/laboratorios?${query}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Proxy GET /api/laboratorios]", error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
