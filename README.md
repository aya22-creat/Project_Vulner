# ProjectVuln - Code Vulnerability Scanner

A comprehensive system for detecting code vulnerabilities using AI-powered analysis. Built with ASP.NET Core, Python/PyTorch AI inference, and Next.js frontend.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│  │   Frontend   │   │  Backend API │   │  AI Service  │ │
│  │  (Next.js)   │   │ (ASP.NET 9)  │   │   (Python)   │ │
│  │  :3001       │   │   :5284      │   │   :8000      │ │
│  └──────────────┘   └──────────────┘   └──────────────┘ │
│        │                    │                    │        │
│        └────────────────────┼────────────────────┘        │
│                             │ (http://ai:8000)            │
│                        ┌────▼──────┐                      │
│                        │ SQLite DB  │                      │
│                        └───────────┘                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (v20.10+)
- Git

### Running with Docker

1. **Clone the repository**
   ```bash
   git clone <repository>
   cd Project_Vulner
   ```

2. **Start all services**
   ```bash
   docker compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:5284
   - AI Service: http://localhost:8000

4. **Stop services**
   ```bash
   docker compose down
   ```

### Using with Environment Variables

Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` as needed. Services will use these values.

## 📦 Services

### Frontend (Next.js)
- **Port**: 3001
- **Container**: projectvuln-frontend
- **Features**:
  - Real-time vulnerability scan results
  - Dashboard with statistics
  - Responsive UI
  - Turbopack dev mode support

### Backend API (ASP.NET Core 9)
- **Port**: 5284
- **Container**: projectvuln-api
- **Features**:
  - RESTful API for code scans
  - Hangfire background job processing
  - SQLite database
  - Rate limiting & error handling
  - CORS enabled for frontend

### AI Service (Python/PyTorch)
- **Port**: 8000
- **Container**: projectvuln-ai
- **Features**:
  - FastAPI inference server
  - PyTorch model inference (CPU/GPU)
  - Vulnerability classification
  - Health check endpoint

## 🔌 API Endpoints

### Code Scan Endpoints
```
POST   /api/codescans              - Submit code for vulnerability scan
GET    /api/codescans              - List all scans with pagination
GET    /api/codescans/{id}         - Get specific scan details
```

### Dashboard Endpoints
```
GET    /api/dashboard/stats        - Get scan statistics
```

### AI Service Endpoints
```
GET    /health                     - AI service health check
POST   /scan                       - Submit code for AI analysis
```

## 📊 Example Usage

### Submit a Code Scan
```bash
curl -X POST http://localhost:5284/api/codescans \
  -H "Content-Type: application/json" \
  -d '{
    "type": 0,
    "code": "def login(user, pass):\n    query = \"SELECT * FROM users WHERE user=\" + user\n    execute(query)"
  }'
```

### Get Dashboard Statistics
```bash
curl http://localhost:5284/api/dashboard/stats | jq
```

### Response Example
```json
{
  "totalScans": 8,
  "vulnerableScans": 8,
  "safeScans": 0,
  "pendingScans": 0,
  "failedScans": 0,
  "recentScans": [
    {
      "id": "uuid",
      "type": 0,
      "hasVulnerabilities": true,
      "status": 2,
      "createdAt": "2026-01-18T11:34:12"
    }
  ]
}
```

## 🔧 Development

### Building Individual Services

```bash
# Build only API
docker build -f ProjectVuln.API/Dockerfile -t projectvuln-api .

# Build only AI Service
docker build -f ProjectVuln.AI/Dockerfile -t projectvuln-ai .

# Build only Frontend
docker build -f code-scan-api/Dockerfile -t projectvuln-frontend .
```

### Local Development (Without Docker)

**Backend API**
```bash
cd ProjectVuln.API
dotnet run
# Runs on https://localhost:5284
```

**AI Service**
```bash
cd ProjectVuln.AI
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python api.py
# Runs on http://localhost:8000
```

**Frontend**
```bash
cd code-scan-api
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:5284 npm run dev
# Runs on http://localhost:3001
```

## 🗂️ Project Structure

```
Project_Vulner/
├── ProjectVuln.API/              # ASP.NET Core Web API
│   ├── Controllers/
│   ├── Middleware/
│   ├── Program.cs
│   └── Dockerfile
├── ProjectVuln.AI/               # Python AI Service
│   ├── api.py                    # FastAPI server
│   ├── inference.py              # Model inference
│   ├── requirements.txt
│   ├── models/                   # AI models directory
│   └── Dockerfile
├── ProjectVuln.Application/      # Application layer
├── ProjectVuln.Domain/           # Domain models
├── ProjectVuln.Infrastructure/   # Data access & services
├── code-scan-api/                # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml            # Multi-container orchestration
├── .env.example                  # Example environment variables
└── README.md                     # This file
```

## 📋 System Requirements

### Docker Setup
- **CPU**: Minimum 2 cores
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Disk**: 2GB free space for images and containers

### Model Requirements
- **AI Model File**: `stage3_best.pt` (PyTorch model)
- **Size**: ~100MB (approximate)
- **Location**: `ProjectVuln.AI/models/stage3_best.pt`

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check which process is using the port
lsof -i :5284

# Stop all containers
docker compose down

# Restart services
docker compose up --build
```

### Database Issues
```bash
# Reset database
docker compose down -v
docker compose up --build
```

### AI Service Not Responding
```bash
# Check AI service logs
docker logs projectvuln-ai

# Verify model file exists
docker exec projectvuln-ai ls -la /app/models/
```

### Frontend Can't Connect to API
```bash
# Verify network connectivity
docker exec projectvuln-frontend curl http://api:5284/api/dashboard/stats
```

## 📚 Technologies

- **Backend**: ASP.NET Core 9, Entity Framework Core, Hangfire
- **AI**: Python 3.11, PyTorch 2.5, FastAPI, Uvicorn
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: SQLite
- **Infrastructure**: Docker, Docker Compose
- **Networking**: Docker Bridge Network

## 🔒 Security Considerations

- Services communicate via internal Docker network
- API uses CORS for frontend access
- Rate limiting on API endpoints
- Environment variables for sensitive config
- Health checks on all services

## 📝 License

[Add your license information here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📞 Support

[Add support information here]

---

**Built with ❤️ for secure code analysis**
