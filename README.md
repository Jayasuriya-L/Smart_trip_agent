# SmartTrip-Agent

SmartTrip-Agent is an AI-powered travel planning application designed for a client-facing product workflow. It combines a modern Next.js frontend, a Python FastAPI backend, and an LLM-powered planning engine to create personalized trip itineraries based on destination, dates, budget, travel style, and traveler preferences.

The system is built to support a conversational planning experience where users ask for a trip plan, the backend maintains session context, the LLM generates structured trip output, and the frontend presents the itinerary in a polished and user-friendly interface.

---

## 1. Project summary

SmartTrip-Agent helps users plan trips by collecting structured inputs such as:

- destination
- date range
- number of travelers
- travel budget
- interests and travel style
- trip duration

The backend then uses an LLM to generate a detailed itinerary with day-wise recommendations, estimated budget, transportation, and research sources. The generated itinerary is returned to the frontend and can be presented in a clean, interactive UI.

The application is designed for real-world delivery, with a clear separation between:

- frontend presentation layer
- application backend
- AI orchestration layer
- database persistence layer

---

## 2. Architecture overview

The architecture follows a standard client-server AI application pattern.

```mermaid
flowchart LR
    User[User / Client] --> FE[Next.js Frontend\nReact + TypeScript + Tailwind]
    FE --> API[FastAPI Backend\nREST API]
    API --> ORCH[LLM Orchestration Layer\nGroqService]
    ORCH --> LLM[Groq LLM Model]
    API --> DB[(PostgreSQL\nAsync SQLAlchemy)]
    FE --> UI[Chat UI + Itinerary UI]
    API --> Parser[Schema Validation\nPydantic Models]
    Parser --> ORCH
```

### High-level flow

1. The user interacts with the frontend chat UI.
2. The frontend sends a request to the backend API endpoint.
3. The backend validates the request and reads or creates the chat session.
4. The backend retrieves previous conversation context from the database.
5. The backend calls the LLM service to generate a trip plan.
6. The response is parsed into structured itinerary data.
7. The itinerary is saved to the database.
8. The frontend renders the assistant response and itinerary panels.

---

## 3. How the agent works

The project uses an agent-style workflow built around a conversational planning loop. The backend acts as the orchestration layer between the user, the database, and the LLM.

### Core method

The working pattern is:

- Receive user prompt
- Load chat session history
- Build a contextual prompt for the LLM
- Send the prompt to the Groq model
- Parse the structured output into itinerary objects
- Save user and assistant messages
- Return response to frontend

### Request flow in the chat endpoint

The backend chat route in `backend/app/routers/chat.py` does the following:

- checks whether a chat session exists
- creates a new session when needed
- fetches recent message history
- passes the prompt and memory into `GroqService`
- saves both the user message and the AI response to the database
- returns the AI response and itinerary payload

This gives the system context memory across the session, which is essential for a good travel assistant experience.

### LLM generation pattern

The LLM is used as a planning engine that takes a natural-language prompt and produces structured travel output. The backend expects the LLM to generate a trip plan with items like:

- destination overview
- daily itinerary
- estimated costs
- transportation options
- research references
- tags and travel insights

This approach combines natural language flexibility with structured output for frontend rendering.

---

## 4. Architecture by layer

### Frontend layer

Location: `smarttrip-frontend/`

Technology:

- Next.js 14
- TypeScript
- Tailwind CSS
- React
- Lucide icons

Responsibilities:

- render chat interface
- collect trip preferences
- display itinerary cards and day plans
- call backend REST endpoints
- manage client-side chat state

Key files:

- `smarttrip-frontend/src/app/page.tsx`
- `smarttrip-frontend/src/app/chat/page.tsx`
- `smarttrip-frontend/src/hooks/useChat.ts`
- `smarttrip-frontend/src/lib/api.ts`

### Backend layer

Location: `backend/app/`

Technology:

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL

Responsibilities:

- expose REST endpoints
- validate incoming requests
- maintain session-based memory
- integrate with the LLM
- persist trip and chat state

Key files:

- `backend/app/main.py`
- `backend/app/routers/chat.py`
- `backend/app/routers/trips.py`
- `backend/app/config.py`
- `backend/app/database.py`

### Data layer

Location: `backend/app/models/`

The database stores:

- trip information
- itinerary structure
- chat sessions
- chat messages

This ensures the application can retain conversation context and preserve previously generated trip plans.

### AI layer

The project is configured to use a Groq-hosted LLM model via the backend service layer. This is the planning intelligence behind the travel recommendations.

The model is called from the backend through a dedicated service abstraction, keeping the orchestration logic clean and maintainable.

---

## 5. Project structure

```text
SmartTrip-Agent/
├── backend/
│   ├── app/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models/
│   │   │   └── trip.py
│   │   ├── routers/
│   │   │   ├── chat.py
│   │   │   └── trips.py
│   │   ├── schemas/
│   │   │   └── trip.py
│   │   └── services/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── .env.example
├── smarttrip-frontend/
│   ├── src/
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 6. Main user flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB
    participant LLM

    User->>Frontend: Enter travel request
    Frontend->>API: POST /api/chat
    API->>DB: Check or create chat session
    API->>DB: Load recent conversation history
    API->>LLM: Send prompt with context
    LLM-->>API: Generated itinerary and response
    API->>DB: Save user + assistant messages
    API-->>Frontend: Structured itinerary + message
    Frontend-->>User: Display trip plan
```

---

## 7. API overview

### Chat endpoint

Method: POST

Endpoint: `/api/chat`

Purpose:

- send a message to the travel assistant
- fetch prior context for the session
- generate an itinerary using the LLM
- return structured output to the frontend

### Trips endpoint

Method: POST / GET

Endpoint: `/api/trips`

Purpose:

- create a saved trip request
- generate a trip record with itinerary data
- retrieve saved trip records and itinerary details

### Health endpoint

Method: GET

Endpoint: `/health`

Purpose:

- simple service health verification

---

## 8. Recommended implementation method

This project follows a practical AI product pattern that is suitable for client work:

### Method used

- frontend captures user intent
- backend acts as the secure orchestration layer
- LLM handles travel reasoning and itinerary generation
- database stores context and persistent records
- schemas enforce valid response structure

This method is effective because it keeps the system:

- scalable
- modular
- maintainable
- easier to deploy
- easier to extend with future features like flights, hotels, maps, or booking integration

### Why this is a good pattern for a client project

- clean separation of concerns
- easy debugging and testing
- strong API contract between frontend and backend
- supports future onboarding and feature expansion
- works well with standard enterprise deployment flows

---

## 9. Environment setup

### 1. Frontend setup

Go to the frontend folder:

```bash
cd smarttrip-frontend
npm install
cp .env.example .env.local
npm run dev
```

If needed, configure the backend URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Backend setup

Go to the backend folder:

```bash
cd backend
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

On Linux or macOS:

```bash
source venv/bin/activate
```

Then install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file with the required variables:

```env
GROQ_API_KEY=your_api_key_here
DATABASE_URL=postgresql+asyncpg://smarttrip:smarttrip_secret@localhost:5432/smarttrip_db
APP_ENV=development
```

Start the API server:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Docker setup

From the root project directory:

```bash
docker-compose up --build
```

This is the easiest way to run the frontend, backend, and database together in a consistent environment.

---

## 10. Key technical decisions

### Why FastAPI

FastAPI is a good fit because it offers:

- fast API development
- Pydantic-based validation
- async support
- clean REST endpoint design
- easy integration with LLM-driven services

### Why PostgreSQL

PostgreSQL is used because the project needs:

- structured storage of trips and sessions
- reliable relational data modeling
- future compatibility for user accounts and bookings

### Why Next.js

Next.js provides:

- fast frontend development
- responsive UI capabilities
- a scalable app structure
- a clean way to build product-facing interfaces

### Why a Groq-powered LLM

The model is used to generate dynamic trip plans from natural user inputs. This is the core product feature and gives the application its AI character.

---

## 11. Notes for client delivery

This README is written to reflect a production-ready client-facing project structure. It presents the solution in a clear and professional way for stakeholders, developers, and reviewers.

For client presentation, the system can be described as:

- an AI travel planning assistant
- a conversational itinerary generator
- a scalable full-stack travel product prototype
- a modular architecture ready for future features

---

## 12. Future enhancement ideas

The current system can be extended with:

- hotel and flight search integration
- map-based destination exploration
- voice-based travel assistant interaction
- multi-language support
- user authentication and profiles
- saved trips dashboard
- itinerary export to PDF or calendar
- payment and booking workflows

---

## 13. Summary

SmartTrip-Agent uses a modern AI product architecture built on:

- Next.js frontend
- FastAPI backend
- PostgreSQL persistence
- Groq LLM orchestration
- session-aware conversational planning

This approach provides a strong foundation for a professional, client-ready AI travel product.
