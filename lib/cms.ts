import type {
  ContentPageItem,
  ContactMessageItem,
  EventItem,
  ListEnvelope,
  MilestoneItem,
  PartnerItem,
  SocialLinkItem,
  SpeakerApplicationItem,
  TeamMemberItem,
  UserItem,
} from "@/lib/types";

export const listKeyMap: Record<string, string> = {
  events: "events",
  partners: "partners",
  team: "members",
  milestones: "milestones",
  content: "pages",
  contact: "messages",
  social: "links",
  speakers: "applications",
  users: "users",
};

export const resourceKeys = Object.keys(listKeyMap) as Array<
  keyof ResourceItemMap
>;

export function isResourceKey(value: string): value is keyof ResourceItemMap {
  return value in listKeyMap;
}

export function normalizeListEnvelope<T>(
  resource: string,
  data: Record<string, unknown>,
) {
  const listKey = listKeyMap[resource];
  if (!listKey) {
    throw new Error(`Unsupported CMS resource: ${resource}`);
  }

  const items = Array.isArray(data[listKey]) ? (data[listKey] as T[]) : [];
  const total = typeof data.total === "number" ? data.total : items.length;
  return { total, items } satisfies ListEnvelope<T>;
}

export type ResourceItemMap = {
  events: EventItem;
  partners: PartnerItem;
  team: TeamMemberItem;
  milestones: MilestoneItem;
  content: ContentPageItem;
  contact: ContactMessageItem;
  social: SocialLinkItem;
  speakers: SpeakerApplicationItem;
  users: UserItem;
};
