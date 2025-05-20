# Murmur – Architecture Overview

## 📱 Client

### Description
The client is a minimalist, real-time chat interface that emphasizes privacy, speed, and focus. It avoids visual clutter and follows a clean UI design.

### Tech Stack
- **React** with **Vite**
- **TypeScript**
- **Zustand** for state management
- **React Query** for data fetching and caching
- **Tailwind CSS** for styling
- **Socket.IO-client** for real-time messaging
- **React Router** for routing

### UI/UX Direction
Based on the landing page:
- **Tone**: Calm, trustworthy, focused — conveyed via soft pastel background and minimal content.
- **Hero Section**: Clear CTA with tagline — _“Conversations. Reimagined.”_
- **Value Proposition Cards**: 
  - End-to-End Encryption
  - Real-time Messaging
  - Noise-Free Design
- **Navigation**: Simple — only a “Login” link in the top right.
- **Design Philosophy**: Minimalist, distraction-free experience with a focus on clarity and privacy.

### Folder Structure
```
client/
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific components (e.g., chat, auth)
│   ├── hooks/             # Zustand stores, custom hooks
│   ├── pages/             # Page-level components
│   ├── services/          # API interaction (axios clients)
│   ├── utils/             # Helper functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🛠 Server

### Description
The server handles authentication, token management, and real-time chat delivery via WebSockets. It connects to a PostgreSQL database hosted on Supabase using Prisma ORM.

### Tech Stack
- **Node.js** with **Express**
- **TypeScript**
- **Socket.IO** for real-time messaging
- **PostgreSQL (Supabase)** for persistence
- **Prisma ORM** for DB access
- **bcrypt** for password hashing
- **jsonwebtoken** for JWT token handling
- **dotenv** for configuration

### Key Architectural Decisions
- **WebSockets** used only for live chat, not for auth.
- **REST APIs** handle user authentication, refresh token rotation, and profile fetching.
- **Refresh Tokens** stored with hashed value, IP address, and user-agent for session validation.
- **Typed Prisma Models** used across services to avoid duplicate interfaces.
- **Unified Error Handling** via `ServiceError` type and centralized error constants.

### Folder Structure
```
server/
├── src/
│   ├── api/
│   │   ├── auth/              # Auth routes (login, register, refresh, me)
│   │   └── chat/              # Chat-specific routes
│   ├── services/              # Core business logic (user, token, chat)
│   ├── models/                # Prisma-generated models
│   ├── middleware/            # Auth, validation
│   ├── sockets/               # Socket.IO setup and event handlers
│   ├── utils/                 # Token utilities, hashing, error helpers
│   ├── errors/
│   │   ├── index.ts           # All exported errors
│   │   └── definitions.ts     # Error constants with code/message
│   ├── prisma/
│   │   └── schema.prisma
│   ├── index.ts               # Entry point for Express app
│   └── server.ts              # HTTP + WebSocket bootstrapping
├── .env
├── tsconfig.json
└── package.json
```