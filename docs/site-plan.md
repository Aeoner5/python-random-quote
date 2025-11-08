## MyPlan Platform Overview

### Core Pages
- **Home**: highlights featured business plans, search/filter, calls-to-action to invest or create a plan.
- **Plan Detail Modal**: surfaced from the home page, shows metrics, funding progress, milestones, and ability to follow or pledge support.
- **Profile Builder**: form-driven flow that captures entrepreneur information, venture summary, roadmap, and funding targets. Persists data to local storage for demo purposes.
- **Chat Lounge**: multi-room chat simulator that allows investors and planners to join public rooms, create ad-hoc rooms, and exchange messages stored locally.

### Key Components
- **Navigation Bar**: persistent top-level navigation with quick access to primary sections.
- **Plan Cards**: reusable UI pattern to summarize proposal information such as category, target funding, and supporters.
- **Room Sidebar**: exposes suggested chat rooms and allows users to spawn new rooms.
- **Message Stream**: grouped messages per room with timestamps and persona badges.

### Data Model (Local Storage Prototype)
- `myplanProfiles`: array of user-created profiles/plans.
- `myplanChatRooms`: collection of chat room metadata (id, title, description, members).
- `myplanMessages`: dictionary keyed by room id containing message history.

### Interaction Flows
- **Create Profile**: user fills out form, preview updates live, submit writes to storage, featured list refreshes.
- **Invest/Follow**: stubbed buttons trigger confirmation snackbar; real integration kept as future work.
- **Chat**: user selects or creates a room, enters display name, posts messages; data retained across reloads in browser demo.

### Future Enhancements
- Persist data with backend service and real authentication.
- Integrate payment rails for actual investment pledges.
- Add moderation and reporting tools for chat rooms.
- Expand analytics dashboards for plan performance.
