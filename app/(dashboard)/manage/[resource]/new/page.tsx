import { notFound } from "next/navigation";

import { ResourceEditor } from "@/components/dashboard/resource-editor";
import { isResourceKey } from "@/lib/cms";
import { resourceConfigs } from "@/lib/resource-config";
import { requireUser } from "@/lib/session";

export default async function ResourceCreatePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  if (!isResourceKey(resource)) {
    notFound();
  }

  const user = await requireUser();
  const config = resourceConfigs[resource];
  const canCreate =
    config.createEnabled !== false &&
    (!config.restrictedTo || config.restrictedTo.includes(user.role));

  if (!canCreate) {
    notFound();
  }

  return <ResourceEditor resourceKey={resource} user={user} mode="create" />;
}
