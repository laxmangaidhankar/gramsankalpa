# GramSankalpa

GramSankalpa is a village intelligence platform for localized agricultural and environmental insights. It combines village boundaries, weather data, satellite indicators, health scoring, crop recommendations, reports, and an AI assistant in a single web application.

## What the System Does

The platform helps users:

- Search and select villages.
- View village boundaries and geographic context.
- Inspect vegetation, water, soil moisture, and land-surface temperature indicators.
- Review weather and historical conditions.
- Calculate village health and agricultural scores.
- Generate crop recommendations and intervention insights.
- Ask questions through an AI assistant.
- Generate reports and view historical activity.

## Architecture

The application uses a React frontend, a Node.js API, and a Python AI service.

```text
Browser
	|
	| React + Vite (localhost:5173)
	v
Node.js API (localhost:8000)
	|\
	| \__ MongoDB, village data, weather, scores, reports, satellite routes
	|
	\____ Python FastAPI AI service (localhost:8001)
					|\
					| \__ Gemini or Ollama providers
					| \__ Google Earth Engine integrations
					\____ AI retrieval, processors, confidence, and audit logging
```

### Frontend

The frontend is located in `client/` and is built with:

- React 18 and React Router
- Vite
- React Query and Zustand for client state and server data
- Leaflet and React Leaflet for maps
- ECharts for data visualization
- i18next for English, Hindi, and Marathi translations
- Tailwind CSS and application-specific CSS

The frontend reads its backend URL from `VITE_API_BASE_URL`. It defaults to `http://localhost:8000`.

### Node.js API

The primary backend is located in `server/` and starts from `server.js`. It is responsible for:

- HTTP routing and CORS configuration
- Request parsing and rate limiting
- Village search, registration, and boundary access
- Weather and historical data routes
- Satellite metrics and tile routes
- Scores, farms, recommendations, reports, and history
- MongoDB connection management
- Forwarding AI requests to the Python service

The Node API is mounted under `/api/v1`.

### Python AI Service

The Python service is located in `server/app/` and starts from `main.py`. It provides the AI-specific endpoints used by Node, including:

- AI summaries
- AI recommendations
- Report narratives
- Streaming AI chat
- Query intent classification
- Context retrieval
- Deterministic agriculture, water, disaster, and scheme processors
- Confidence scoring and audit logging

Node forwards requests from its `/api/v1/ai/...` routes to Python at `http://127.0.0.1:8001`. The Python service must be running for AI features to work.

## Repository Structure

```text
client/
	src/                 React application, pages, layouts, hooks, and services
	public/              Static frontend assets
	package.json         Frontend scripts and dependencies

server/
	server.js            Node.js API entry point
	routes/              Express route modules
	services/            Node business logic and external integrations
	models/              Mongoose models
	config/              Node configuration, including MongoDB
	data/                Geographic data such as Maharashtra boundaries
	main.py              Python FastAPI entry point
	app/                 Python API, AI, scoring, weather, and Earth Engine code
	api/index.py         Vercel Python adapter
	requirements.txt     Python dependencies
	vercel.json          Vercel routing and function configuration
```

## Prerequisites

- Node.js 18 or newer
- npm
- Python 3.11 or newer
- A Python virtual environment
- MongoDB, if persistent database storage is required
- Google Earth Engine credentials, if Earth Engine features are enabled
- A Gemini API key, if Gemini is used as the AI provider

## Installation

### 1. Install frontend dependencies

```powershell
cd client
npm install
```

### 2. Install Node backend dependencies

```powershell
cd ..\server
npm install
```

### 3. Create a Python virtual environment

From the `server/` directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Environment Configuration

### Frontend: `client/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Node backend: `server/.env`

```env
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/gramsankalpa
ALLOWED_ORIGINS=http://localhost:5173
PYTHON_AI_URL=http://127.0.0.1:8001
```

If MongoDB is unavailable, the Node service logs a warning and uses its in-memory fallback behavior where supported. Do not commit `.env` files or credentials.

### Python service: `server/.env`

```env
GEMINI_API_KEY=your_gemini_api_key
GEE_PROJECT_ID=your_google_cloud_project
GEE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GEE_CREDENTIALS_PATH=./credentials/gee_credentials.json
OPENMETEO_BASE_URL=https://api.open-meteo.com/v1
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000
DEBUG=true
USE_MOCK_DATA=false
DEMO_MODE=false
DEMO_TOKEN=
```

`GEE_CREDENTIALS_PATH` must point to a valid Google Earth Engine service-account credential file when `USE_MOCK_DATA=false`. Keep that file outside version control.

## Running the System Locally

Start each service in a separate terminal.

### Terminal 1: Python AI service

```powershell
cd server
.\.venv\Scripts\Activate.ps1
npm run ai:start
```

For Python auto-reload during development:

```powershell
npm run ai:dev
```

The AI service listens on `http://127.0.0.1:8001`.

### Terminal 2: Node API

```powershell
cd server
npm run dev
```

The Node API listens on `http://localhost:8000`.

### Terminal 3: React frontend

```powershell
cd client
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Useful Commands

### Client

```powershell
npm run dev       # Start Vite development server
npm run build     # Create a production frontend build
npm run preview   # Preview the production build locally
```

### Node server

```powershell
npm start         # Start the Node API
npm run dev       # Start Node with file watching
```

### Python service

```powershell
npm run ai:start  # Start FastAPI through Uvicorn
npm run ai:dev    # Start FastAPI with reload enabled
```

## API Groups

The Node API exposes route groups under `/api/v1`, including:

- `/health` for service and MongoDB status
- `/villages` for search, village details, boundaries, and registration
- `/weather` for current and historical weather data
- `/recommendations` for crop recommendations and analysis
- `/ai` for requests proxied to the Python service
- `/satellite` for layers, metrics, statistics, values, and tiles
- `/scores` for village health and environmental scores
- `/farms` for farm-related operations
- `/reports` for report generation and report data
- `/analysis` for analysis workflows
- `/history` for stored user or analysis history

The root endpoint, `GET /`, returns basic API identity information. The health endpoint, `GET /api/v1/health`, is the recommended basic connectivity check.

## Data and External Services

- **MongoDB:** Stores application records such as farms, weather data, recommendations, chat history, and villages where applicable.
- **Open-Meteo:** Supplies current and historical weather data without an API key.
- **Google Earth Engine:** Supplies satellite-derived layers and geographic analysis when configured.
- **Gemini or Ollama:** Provides AI-generated responses through the Python service.
- **Local geographic data:** `server/data/maharashtra.geojson` supports village and boundary workflows.

## Deployment Notes

The repository contains `server/vercel.json` and `server/api/index.py` for a Python FastAPI deployment on Vercel. That deployment path is separate from the normal local Node-plus-Python setup.

Before deploying:

1. Set the frontend API URL to the deployed Node API.
2. Configure all server environment variables in the hosting platform.
3. Store MongoDB, Gemini, and Earth Engine credentials as secrets.
4. Ensure the Node API can reach the Python AI service through `PYTHON_AI_URL`.
5. Build the frontend with `npm run build` and deploy the resulting `client/dist` directory according to the chosen host.

## Troubleshooting

### AI requests return `Python AI service unavailable`

Start the Python service on port `8001` and verify that `PYTHON_AI_URL` matches its address.

### The frontend cannot reach the API

Check `client/.env`, confirm that Node is running on port `8000`, and make sure the frontend origin is included in `ALLOWED_ORIGINS`.

### MongoDB connection warnings appear

Check `MONGODB_URI` and confirm that MongoDB is running. The application may continue with in-memory fallback behavior, but data will not be persistent.

### Earth Engine initialization fails

Check the project ID, service-account email, credential path, and Earth Engine permissions. For local development without Earth Engine, set `USE_MOCK_DATA=true` where supported.

## Security and Operations

- Never commit `.env` files, API keys, service-account credentials, or database passwords.
- Use a production MongoDB connection string in deployed environments.
- Restrict CORS origins to trusted frontend domains.
- Replace development defaults such as `DEBUG=true` before production deployment.
- Review generated AI audit logs because they contain query metadata and village identifiers.

## Project Status

The application is organized as a working full-stack prototype with a Node.js primary API and a Python AI service. Some integrations support fallback or mock behavior, while production-grade deployment requires configuring MongoDB, AI credentials, Earth Engine credentials, and the service-to-service network connection.
