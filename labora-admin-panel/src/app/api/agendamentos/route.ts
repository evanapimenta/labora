import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/session";
import { apiFetch, apiFetchWithAudit } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.toString();
    const data = await apiFetch(`/api/agendamentos?${query}`);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Proxy GET /api/agendamentos]", error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;

    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const data = await apiFetchWithAudit('/api/agendamentos', {
      method: 'POST',
      body: JSON.stringify(body)
    }, user, ip);

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[Proxy POST /api/agendamentos]", error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
