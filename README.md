# Typing Race — Minimalist Multiplayer Typing Platform

> Fast, distraction-free real-time typing competitions and solo speed practice, built with **Next.js**, **Socket.IO**, **TypeScript**, and **Tailwind CSS**.

---

## 1. Overview

**Typing Race** is an editorial, high-performance web application designed for competitive typists and developers. Taking inspiration from Swiss typography, minimal developer tools, and tactile indie games, the interface strips away gamified noise (neon gradients, loud badges, visual clutter) in favor of high-contrast readability, precise telemetry, and synchronous real-time multiplayer racing.

Whether practicing solo across configurable timed sessions (15s, 30s, 60s) or battling friends in custom multiplayer lobbies with real-time lane tracking, the platform delivers instant feedback and responsive typing dynamics.

---

## 2. Key Features

- **Multiplayer Race Rooms**: Create or join custom race rooms instantly. Share room codes, direct invite links, or scannable on-screen QR codes.
- **Synchronized Race Starts**: Room hosts initiate races that broadcast identical passages to all racers simultaneously with an synchronized 3-second countdown.
- **Live Competitor Telemetry**: Real-time progress lanes show each racer's percentage completion, current WPM, and finish state as keystrokes happen.
- **Built-in AI Bot Racers**: Single-click testing via `+ Add 3 Bots` or `+ Add 1 Bot` in the lobby, spinning up realistic bot racers (65–95 WPM) for immediate multiplayer practice without needing extra human players.
- **Solo Practice Mode**: Offline typing test with selectable durations (15s, 30s, 60s), live WPM, character accuracy diffing, and post-session breakdown.
- **Deduplicated Leaderboard**: Accurate post-race standings table with rankings, WPM, accuracy %, completion status, and host-driven rematch capability.
- **Desktop Guardrail**: Built-in Next.js Edge Middleware detects mobile user agents and provides a clean desktop recommendation page to ensure tests are taken on physical keyboards.

---

## 3. Visual Design System

The application is art-directed with a restrained **Swiss Editorial Minimalist** design system:

| Token | Hex Value | Purpose |
| :--- | :--- | :--- |
| **Canvas** | `#F6F4EF` | Warm off-white paper canvas background |
| **Ink** | `#191919` | High-contrast near-black primary text and headers |
| **Muted** | `#77756F` | Secondary labels, untyped passage characters, metadata |
| **Border** | `#E3E0D8` | 1px hairline borders for panels and tables |
| **Accent** | `#FF4B35` | Vermilion signal color for active cursor, user badges, errors |

### Typography
- **Interface & UI**: Clean modern sans-serif (`Inter` / system UI sans) with tight tracking and clear hierarchy.
- **Typing Passage & Metrics**: `JetBrains Mono` / monospace font for character-grid alignment and monospace metric counters.

---

## 4. Architecture & Data Flow

```mermaid
graph TD
    subgraph Browser Clients
        Host[Host Racer]
        Player[Guest Racer]
        Bots[Simulated Bots]
    end

    subgraph Next.js Application
        AppRouter[App Router Pages<br/>/, /room/[id], /test]
        Middleware[Next.js Middleware<br/>Desktop Detection]
        PagesSocket[Pages API Route<br/>/api/socket]
    end

    subgraph Socket.IO Engine
        RoomState[In-Memory Rooms Adapter]
        Broadcast[Event Hub & Telemetry Dispatcher]
    end

    Host -->|join-room, start-race| PagesSocket
    Player -->|join-room, player-progress| PagesSocket
    Bots -->|join-room, player-progress| PagesSocket
    PagesSocket --> RoomState
    RoomState --> Broadcast
    Broadcast -->|race-started| Host & Player & Bots
    Broadcast -->|opponent-progress| Host & Player
    Broadcast -->|user-finished| Host & Player
```

### Telemetry & Real-Time Sync
1. **Lobby Orchestration**: When players join `/room/[roomId]`, the client connects to `/api/socket`. The server updates the roster via `update-players`.
2. **Race Generation**: The host generates a randomized text passage via `generateText()` and emits `start-race`. The server broadcasts `race-started` with the shared passage to every client in the room.
3. **Live Telemetry Dispatch**: On every keystroke, the active typist computes their live WPM and progress percentage, emitting `player-progress`. The server forwards this using `socket.to(roomId).emit("opponent-progress")` to all opponents without echoing back to the sender.
4. **Finish Coordination**: When a player completes the passage, `typing-finished` is emitted. Opponents receive `user-finished` to lock that racer's final stats, while the finisher immediately views their post-race summary and standings.
5. **Synchronized Rematch**: The host can trigger `rematch-race` with a freshly generated passage, resetting all racers into the race state simultaneously.

---

## 5. Socket.IO Protocol Specification

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `check-room` | Client &rarr; Server | `{ roomId: string }` | Verifies whether a room currently exists before joining. |
| `join-room` | Client &rarr; Server | `{ roomId, username }` | Joins the specified room and updates the active roster. |
| `update-players` | Server &rarr; Client | `string[]` | Emits the complete list of racer usernames currently in the room. |
| `start-race` | Client (Host) &rarr; Server | `{ roomId, text }` | Host signals the race to begin with the generated passage. |
| `race-started` | Server &rarr; Client | `{ text: string }` | Notifies all racers in the room that the race countdown has begun. |
| `player-progress` | Client &rarr; Server | `{ roomId, username, progress, wpm }` | Sends live progress percentage and current WPM. |
| `opponent-progress` | Server &rarr; Client | `{ username, progress, wpm }` | Broadcasts an opponent's telemetry to other racers. |
| `typing-finished` | Client &rarr; Server | `{ roomId, result }` | Racer signals completion with final WPM, accuracy, and rank. |
| `user-finished` | Server &rarr; Client | `Opponent` | Broadcasts a racer's final stats to remaining competitors. |
| `rematch-race` | Client (Host) &rarr; Server | `{ roomId, text }` | Host triggers a rematch with a new text passage. |

---

## 6. Project Structure

```
typing-test/
├── src/
│   ├── app/
│   │   ├── globals.css              # Swiss typography design tokens & styling rules
│   │   ├── layout.tsx               # Root layout, font bindings, header & footer
│   │   ├── page.tsx                 # Home page: Host room, join room, solo test
│   │   ├── Join/
│   │   │   └── page.tsx             # Standalone room join route
│   │   ├── TypingTest/
│   │   │   └── page.tsx             # Solo typing practice route
│   │   ├── not-supported/
│   │   │   └── page.tsx             # Non-desktop fallback notice
│   │   └── room/
│   │       └── [roomId]/
│   │           └── page.tsx         # Multiplayer room wrapper
│   ├── components/
│   │   ├── RoomClient.tsx           # Lobby state, QR code modal, bot simulations
│   │   ├── TypingRace.tsx           # Core multiplayer engine, lanes, typing area & standings
│   │   ├── TypingTest.tsx           # Solo practice engine with 15/30/60s duration toggle
│   │   └── typewriter-effect.tsx    # Minimalist typewriter animation component
│   ├── lib/
│   │   ├── socket.ts                # Client-side Socket.IO singleton instance
│   │   └── utils.ts                 # Classname utility helpers (clsx, tailwind-merge)
│   ├── pages/
│   │   └── api/
│   │       └── socket.ts            # Next.js Pages API route hosting Socket.IO server
│   ├── utils/
│   │   └── generateText.ts          # Curated quotes and randomized typing passage generator
│   └── middleware.ts                # Viewport and device detection middleware
├── package.json
├── tsconfig.json
└── README.md
```

---

## 7. Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or later (Node.js 20+ recommended)
- **npm**, **pnpm**, or **yarn**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Varun24-s/typing-mania.git
   cd typing-mania
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 8. Testing Multiplayer Locally

You can test multiplayer races in two convenient ways:

### Option A: Using Built-in Bot Racers (Recommended)
1. Navigate to [http://localhost:3000](http://localhost:3000).
2. Enter your username and click **Host Room**.
3. In the lobby, click **+ Add 3 Bots**.
4. The bots (`Nitro`, `GhostRacer`, `Apex`) will immediately join your roster.
5. Click **Start Race** and compete against them in real time!

### Option B: Using Multiple Browser Windows / Incognito
1. In Window 1, host a room and copy the Room ID or share URL.
2. In Window 2 (or an incognito window), navigate to the share URL or enter the Room ID on the home page.
3. Start the race from the host window; both windows will synchronize and start simultaneously.

---

## 9. Verification & Scripts

- **Type Check**:
  ```bash
  npx tsc --noEmit
  ```
- **Lint**:
  ```bash
  npm run lint
  ```
- **Production Build**:
  ```bash
  npm run build
  npm run start
  ```

---

## 10. License

MIT &copy; [Varun S](https://github.com/Varun24-s). Distributed under the MIT License.
