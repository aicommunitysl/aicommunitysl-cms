# Changelog

All notable changes to this project are documented in this file.

Changes are organized into the following categories:

- **Added:** New features or functionality introduced to the project.
- **Changed:** Modifications to existing functionality that do not add new features.
- **Fixed:** Bug fixes that resolve issues or correct unintended behavior.
- **Removed:** Features or components that have been removed from the project.

## [Unreleased]

- Changes for the next release are available in development branches.

## [v1.0.0] - 2026-06-30

### Added

- Community standards: branch naming guidelines, commit message guidelines, pull request guidelines, contributing guide, code of conduct, security policy, versioning guide, changelog, citation, and license (refs #1)
- Next.js project configuration: TypeScript, Tailwind CSS v4, ESLint, and PostCSS setup (refs #1)
- API client, CMS utilities, types, and resource configuration (refs #1)
- Dashboard shell, login form, and reusable UI components (refs #1)
- Authentication, dashboard pages, and API routes (refs #1)
- Google OAuth sign-in replacing email/password login (refs #1)
- OAuth proxy routes and session handling (`/api/auth/google/login`, `/api/auth/google/callback`) (refs #1)
- Resource CRUD pages for events, partners, team members, milestones, about content, static pages, contact messages, social links, speaker applications, and users (refs #1)
- Responsive login page, sidebar, and dashboard redesign with mobile support (refs #1)
- Event form fields with date/time split, type dropdown, and structured speaker/session lists (refs #1)
- SpeakerListField and SessionListField editors with checkbox alignment and save toast (refs #1)
- Session order management with move up/down controls (refs #1)
- Themed bottom-center toast notifications via react-hot-toast (refs #1)
- SocialLinksField component and image preview thumbnail in resource editor (refs #1)
- SocialLinkEntry type and social-links field config for team resource (refs #1)
- Image upload proxied to API with resource type passed as Cloudinary subfolder (refs #1)
- Event task management with Kanban board and table view (refs #1)
- Event tab strip to group and filter tasks by event (refs #1)
- Event task board, table, form, and card components (refs #1)
- Assignee selection from team members list in event task form (refs #1)
- Event-tasks to list key map, resource item map, and API map (refs #1)
- Event task count metric on the overview dashboard (refs #1)
- Full-width edge-to-edge layout shell (refs #1)
- Event-task status proxy route (`/api/proxy/events/[id]/tasks/[taskId]/status`) (refs #1)
- react-hot-toast dependency (refs #1)

### Changed

- Event task mutations routed through CMS proxy instead of direct API calls (refs #1)
- Token prop removed from event-task UI components (server-side proxy handles auth) (refs #1)
- Overview metrics loaded server-side (refs #1)
- OAuth login passes `NEXT_PUBLIC_APP_URL` as `frontend_url` for correct redirect domain (refs #1)

### Fixed

- Logo aspect ratio and dark mode inversion removed (refs #1)
- Correct API response key `members` for team list in event tasks page (refs #1)
- Generic resource config key types narrowed (refs #1)
- Fallback key mismatch in teamData catch block resolved (refs #1)
- Invalid `outline` Button variant replaced with `secondary` (refs #1)
- Unsupported `token` prop removed from EventTasksManager (refs #1)

<!-- e.g., -->
<!-- Unreleased -->
<!-- v2.0.0 -->
<!-- v1.1.0 -->
<!-- v1.0.0 -->
<!-- v0.0.1 -->

[Unreleased]: https://github.com/aicommunitysl/aicommunitysl-cms/compare/v1.0.0...HEAD
[v1.0.0]: https://github.com/aicommunitysl/aicommunitysl-cms/releases/tag/v1.0.0
