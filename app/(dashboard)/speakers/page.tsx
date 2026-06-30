import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function SpeakersPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("speakers");
  return (
    <ResourceManager
      resourceKey="speakers"
      initialItems={initialItems}
      user={user}
    />
  );
}
