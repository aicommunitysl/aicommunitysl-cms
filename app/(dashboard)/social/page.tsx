import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function SocialPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("social");
  return (
    <ResourceManager
      resourceKey="social"
      initialItems={initialItems}
      user={user}
    />
  );
}
