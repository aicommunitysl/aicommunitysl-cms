import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function EventsPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("events");
  return (
    <ResourceManager
      resourceKey="events"
      initialItems={initialItems}
      user={user}
    />
  );
}
