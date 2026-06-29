import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/session";
import { apiFetch } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    const range = req.nextUrl.searchParams.get("range") ?? "30";

    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    const user = session ? await verifyToken(session) : null;
    const activeLabId = cookieStore.get('active_lab_id')?.value;
    const activeBranchId = cookieStore.get('active_branch_id')?.value;

    const data = await apiFetch('/api/dashboard/export-data', {
      method: 'POST',
      body: JSON.stringify({
        range,
        user,
        activeLabId,
        activeBranchId
      })
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Proxy pdf-data]", error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
