import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function ContentPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("content");
  return (
    <ResourceManager
      resourceKey="content"
      initialItems={initialItems}
      user={user}
    />
  );
}
