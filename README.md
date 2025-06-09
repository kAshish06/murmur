# Murmur - Real-time Chat Application

Murmur is a modern, real-time chat application built with a focus on reliability, performance, and user experience. It features a robust client-side message queue system, real-time updates via WebSockets, and a scalable backend architecture.

## Technologies Used

### Client
- **Frontend Framework**: React 19
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.IO Client
- **Data Fetching**: React Query
- **Form Handling**: React Hook Form
- **Routing**: React Router v7
- **UI Components**: Lucide Icons, Hero Icons
- **Build Tool**: Vite
- **Type Safety**: TypeScript
- **Browser Storage**: IndexedDB (via IDB)
- **Code Quality**: ESLint, Prettier

### Server
- **Runtime**: Node.js
- **Web Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time Communication**: Socket.IO
- **Message Queue**: RabbitMQ
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Rate Limiting**: rate-limiter-flexible
- **Input Sanitization**: xss
- **Logging**: Winston
- **Testing**: Jest, ts-jest
- **Containerization**: Docker
- **Container Orchestration**: Docker Compose

## Architecture

### Client Architecture

The client application is built with a focus on offline-first capabilities and reliable message delivery. Key architectural components include:

1. **State Management**
   - Global state managed using Zustand
   - Local message queue for offline support
   - Optimistic UI updates

2. **Message Queue System**
   - **QueueManager**: Manages outgoing, incoming, and retry queues
   - **QueueProcessor**: Processes messages in batches with retry logic
   - **Message Persistence**: Messages stored in IndexedDB for offline access
   - **Status Tracking**: Tracks message delivery status (PENDING, SENT, DELIVERED, SEEN, FAILED)

3. **Real-time Communication**
   - WebSocket connection via Socket.IO
   - Automatic reconnection with exponential backoff
   - Message acknowledgment and delivery receipts

4. **UI Components**
   - Responsive design with mobile-first approach
   - Virtualized lists for optimal performance with large message histories
   - Optimistic UI updates for instant feedback

### Server Architecture

The server is designed for scalability and reliability with a microservices-oriented architecture:

1. **API Layer**
   - RESTful endpoints for user authentication and chat operations
   - WebSocket endpoints for real-time communication
   - Rate limiting and request validation

2. **Database Layer**
   - PostgreSQL for persistent data storage
   - Prisma ORM for type-safe database access
   - Database schema with proper indexing for performance

3. **Real-time Layer**
   - Socket.IO for WebSocket communication
   - Presence tracking for online/offline status
   - Room-based messaging for conversations

4. **Message Processing**
   - RabbitMQ for reliable message queuing
   - Background workers for processing messages
   - Retry mechanisms for failed deliveries

5. **Caching Layer**
   - Redis for caching frequently accessed data
   - Rate limiting and throttling
   - Session management

### Data Flow

1. **Sending a Message**
   - User sends a message through the UI
   - Message is added to the local queue (IndexedDB)
   - QueueProcessor picks up the message and sends it via WebSocket
   - Server acknowledges receipt and broadcasts to recipients
   - Message status is updated based on delivery confirmation

2. **Receiving a Message**
   - Server receives message via WebSocket
   - Message is processed and stored in the database
   - Recipient's client is notified in real-time
   - Message is displayed in the UI with appropriate status

3. **Offline Support**
   - Messages are queued locally when offline
   - Queue is processed when connection is restored
   - Conflict resolution for messages sent while offline

## Project Structure

```
.
├── client/                    # Frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── Auth/             # Authentication related components and logic
│   │   ├── ConversationsPage/# Chat interface components
│   │   │   └── context/      # Context providers for chat
│   │   ├── LandingPage/      # Landing page components
│   │   ├── apiUtils/         # API utility functions
│   │   ├── assets/           # Static assets (images, fonts, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── routes/           # Application routes configuration
│   │   ├── services/         # Business logic and services
│   │   ├── socket/           # Socket.IO client configuration
│   │   ├── store/            # Global state management (Zustand stores)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Application entry point
│   └── ...
│
├── server/                   # Backend application
│   ├── prisma/               # Database schema and migrations
│   ├── src/                  # Source code
│   │   ├── config/           # Configuration files
│   │   ├── errors/           # Custom error classes and handlers
│   │   ├── messageProcessing/# Message processing logic
│   │   ├── middleware/       # Express middleware
│   │   │   ├── errorHandler.ts # Global error handler
│   │   │   ├── logger.ts     # Request logging
│   │   │   ├── rateLimiter.ts # Rate limiting
│   │   │   └── sanitiseUserInput.ts # Input sanitization
│   │   ├── routes/           # API route definitions
│   │   │   ├── auth.ts       # Authentication routes
│   │   │   ├── chat.ts       # Chat-related routes
│   │   │   └── user.ts       # User management routes
│   │   ├── services/         # Business logic
│   │   │   ├── rabbitmqService.ts  # RabbitMQ integration
│   │   │   └── presenceService.ts  # User presence tracking
│   │   ├── socket/           # Socket.IO server implementation
│   │   │   └── middleware/   # Socket.IO middleware
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions
│   │   └── index.ts          # Application entry point
│   └── ...
│
├── redis-config/            # Redis configuration
├── docker-compose.yml        # Docker Compose configuration
└── docker-deploy.sh          # Deployment script
```

## License

[MIT](LICENSE)
