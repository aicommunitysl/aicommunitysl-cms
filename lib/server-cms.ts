import "server-only";

import { apiRequest, getResourcePath } from "@/lib/api";
import { normalizeListEnvelope, type ResourceItemMap } from "@/lib/cms";
import { getAuthToken } from "@/lib/session";

export async function getResourceItems<K extends keyof ResourceItemMap>(
  resource: K,
) {
  const token = await getAuthToken();
  if (!token) {
    return [] as ResourceItemMap[K][];
  }

  const path =
    resource === "users" ? "/api/v1/users" : getResourcePath(resource);
  const remoteData = await apiRequest<Record<string, unknown>>(path, {
    token,
  });

  return normalizeListEnvelope<ResourceItemMap[K]>(resource, remoteData).items;
}
