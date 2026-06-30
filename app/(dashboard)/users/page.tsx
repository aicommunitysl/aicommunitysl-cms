import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireAdminUser } from "@/lib/session";

export default async function UsersPage() {
  const user = await requireAdminUser();
  const initialItems = await getResourceItems("users");
  return (
    <ResourceManager
      resourceKey="users"
      initialItems={initialItems}
      user={user}
    />
  );
}
