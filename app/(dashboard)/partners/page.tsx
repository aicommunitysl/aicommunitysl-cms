import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function PartnersPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("partners");
  return (
    <ResourceManager
      resourceKey="partners"
      initialItems={initialItems}
      user={user}
    />
  );
}
