
import { getCurrentUser } from "@/lib/auth";
import StoreClient from "./StoreClient";
import AuthGateCard from "../components/AuthGateCard";

export default async function StorePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthGateCard
        emoji="👑"
        title="Elite Store"
        description="Sign in to browse exclusive memberships and community elevation tools."
      />
    );
  }

  return <StoreClient />;
}
