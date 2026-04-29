import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function MilestonesPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("milestones");
  return (
    <ResourceManager
      resourceKey="milestones"
      initialItems={initialItems}
      user={user}
    />
  );
}
