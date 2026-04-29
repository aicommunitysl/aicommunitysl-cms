export type UserRole = "admin" | "editor";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface SpeakerSlot {
  name: string;
  role?: string;
  image_url?: string;
}

export interface EventSessionItem {
  title: string;
  time: string;
  speaker?: string;
  description?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  event_type: string;
  image_url?: string;
  registration_url?: string;
  tags: string[];
  max_participants?: number;
  is_published: boolean;
  speakers: SpeakerSlot[];
  sessions: EventSessionItem[];
  created_at: string;
  updated_at: string;
}

export interface PartnerItem {
  id: string;
  name: string;
  description?: string;
  logo_url: string;
  website_url?: string;
  partner_type: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TeamSocialLinks {
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface TeamMemberItem {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image_url: string;
  email?: string;
  social_links?: TeamSocialLinks;
  team_category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  date: string;
  milestone_type: string;
  image_url?: string;
  link_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentSectionItem {
  title: string;
  body: string;
  items: string[];
}

export interface ContentPageItem {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  hero_title?: string;
  hero_body?: string;
  seo_title?: string;
  seo_description?: string;
  is_published: boolean;
  sections: ContentSectionItem[];
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved" | "archived";
  notes?: string;
  email_sent: boolean;
  email_error?: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLinkItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  handler?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpeakerApplicationItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio: string;
  expertise_areas: string[];
  talk_title: string;
  talk_description: string;
  talk_duration?: string;
  previous_talks?: string;
  linkedin_url?: string;
  website_url?: string;
  status: string;
  notes?: string;
  reviewed_by?: string;
  scheduled_event_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserItem extends SessionUser {}

export interface ListEnvelope<T> {
  total: number;
  items: T[];
}
