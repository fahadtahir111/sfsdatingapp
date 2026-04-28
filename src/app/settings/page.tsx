
import { getCurrentUser } from "@/lib/auth";
import SettingsClient from "./SettingsClient";
import AuthGateCard from "../components/AuthGateCard";

export default async function SettingsHub() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthGateCard
        emoji="⚙️"
        title="Member Settings"
        description="Sign in to manage your elite profile and account preferences."
      />
    );
  }

  return <SettingsClient />;
}
