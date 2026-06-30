import { notFound } from "next/navigation";

import { ResourceEditor } from "@/components/dashboard/resource-editor";
import { getResourceItem, getResourceItems } from "@/lib/server-cms";
import {
  ensureContentEntries,
  isConfiguredResourceKey,
  resourceConfigs,
} from "@/lib/resource-config";
import { requireUser } from "@/lib/session";

export default async function ResourceEditPage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource, id } = await params;
  if (!isConfiguredResourceKey(resource)) {
    notFound();
  }

  const user = await requireUser();
  const config = resourceConfigs[resource];
  const canEdit =
    config.editEnabled !== false &&
    (!config.restrictedTo || config.restrictedTo.includes(user.role));

  if (!canEdit) {
    notFound();
  }

  let initialItem;

  try {
    initialItem =
      resource === "content"
        ? ensureContentEntries(await getResourceItems("content")).find(
            (item) => item.slug === id,
          )
        : await getResourceItem(resource, id);
  } catch {
    notFound();
  }

  if (!initialItem) {
    notFound();
  }

  return (
    <ResourceEditor
      resourceKey={resource}
      user={user}
      mode="edit"
      recordId={id}
      initialItem={initialItem}
    />
  );
}
