import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/session";
import { getConsolidatedDashboardData } from "@/actions/dashboard";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    range?: string;
  }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { range } = await searchParams;

  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const sessionUser = session ? await verifyToken(session) : null;

  if (sessionUser?.scope === 'TECH') {
    redirect('/agendamentos');
  }

  // Fetch initial data using default range if not specified
  const data = await getConsolidatedDashboardData(range || "30");
  const userName: string = sessionUser?.name?.split(" ")[0] ?? "Usuário";

  return (
    <DashboardClient
      initialData={data}
      userName={userName}
      sessionUser={sessionUser}
    />
  );
}
