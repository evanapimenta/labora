import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api-client";

export async function GET() {
  try {
    const csvData = await apiFetch('/api/audit-logs/export');
    const date = new Date().toISOString().slice(0, 10);
    const filename = `auditoria-${date}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[Proxy export/auditoria]", error);
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
}
