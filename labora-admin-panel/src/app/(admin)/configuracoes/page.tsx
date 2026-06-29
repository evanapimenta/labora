import { getAccessibleBranches } from "@/lib/branches";
import { getAdminProfile } from "@/actions/user";
import ConfiguracoesClient from "./ConfiguracoesClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações — Labora",
  description: "Gerencie seu perfil e configurações de segurança",
};

export default async function ConfiguracoesPage() {
  const { user } = await getAccessibleBranches();

  if (!user) {
    return null; // Will redirect to login via middleware
  }

  const adminId = user.userId || user.id || user._id;
  const fullProfile = adminId ? await getAdminProfile(adminId) : null;
  const finalUser = fullProfile || user;

  return <ConfiguracoesClient user={finalUser} />;
}
