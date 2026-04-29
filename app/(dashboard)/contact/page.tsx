import { ResourceManager } from "@/components/dashboard/resource-manager";
import { getResourceItems } from "@/lib/server-cms";
import { requireUser } from "@/lib/session";

export default async function ContactPage() {
  const user = await requireUser();
  const initialItems = await getResourceItems("contact");
  return (
    <ResourceManager
      resourceKey="contact"
      initialItems={initialItems}
      user={user}
    />
  );
}
