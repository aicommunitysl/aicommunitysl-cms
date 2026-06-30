import type { ComponentType } from "react";

import {
  CalendarDays,
  FileText,
  Handshake,
  Home,
  Inbox,
  KanbanSquare,
  Milestone,
  Radio,
  Sparkles,
  Users,
  UserSquare2,
} from "lucide-react";

import type { UserRole } from "@/lib/types";

export const contentSlugs = [
  {
    slug: "about",
    label: "About",
    description: "Mission, vision, values, and chapter story.",
  },
  {
    slug: "privacy-policy",
    label: "Privacy Policy",
    description: "Privacy disclosure and data handling policy.",
  },
  {
    slug: "terms-of-service",
    label: "Terms of Service",
    description: "Platform usage terms and legal language.",
  },
] as const;

export const navigationItems: Array<{
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
}> = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/event-tasks", label: "Event Tasks", icon: KanbanSquare },
  { href: "/partners", label: "Partners", icon: Handshake },
  { href: "/team", label: "Team", icon: Users },
  { href: "/milestones", label: "Milestones", icon: Milestone },
  { href: "/content", label: "Pages", icon: FileText },
  { href: "/contact", label: "Contact", icon: Inbox },
  { href: "/social", label: "Social", icon: Radio },
  { href: "/speakers", label: "Speakers", icon: Sparkles },
  { href: "/users", label: "Users", icon: UserSquare2, roles: ["admin"] },
];

export const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  editor: "Editor",
};
