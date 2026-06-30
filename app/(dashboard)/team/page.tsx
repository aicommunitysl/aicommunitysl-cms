import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function TeamPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("team");
  return (
    <ResourceManager
      resourceKey="team"
      initialItems={initialItems}
      user={user}
    />
  );
}
