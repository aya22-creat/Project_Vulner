# Quick Start Guide - Project Vulner

## ⚡ One-Command Setup & Run

### Terminal 1: AI Service (Python)
```bash
cd ProjectVuln.AI
pip install -r requirements.txt
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```
✅ Runs on: **http://localhost:8000**

### Terminal 2: Backend API (.NET)
```bash
cd ProjectVuln.API
dotnet run
```
✅ Runs on: **https://localhost:5284**

### Terminal 3: Frontend (Next.js)
```bash
cd code-scan-api
pnpm install
pnpm dev
```
✅ Runs on: **http://localhost:3000**

---

## ✅ Verify Everything Works

1. **Health Check AI Service**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Health Check Backend**
   ```bash
   curl https://localhost:5284/api/codescans -k
   ```

3. **Open Frontend**
   - Navigate to: http://localhost:3000
   - Should see "All Scans" page
   - Should show 0 scans initially

4. **Test Scan**
   - Click "New Scan"
   - Paste code (or URL)
   - Submit
   - Monitor Network tab (F12) for requests

---

## 📋 First Time Setup

### Install All Dependencies

```bash
# Backend
cd ProjectVuln.API
dotnet restore
dotnet build

# Frontend
cd ../code-scan-api
pnpm install

# AI Service
cd ../ProjectVuln.AI
pip install -r requirements.txt
```

---

## 🔧 Common Issues & Fixes

### ❌ Port Already in Use

**Port 5284 (Backend):**
```bash
# Find process
lsof -i :5284
# Kill it
kill -9 <PID>
# Or use different port
dotnet run --urls "https://localhost:5285"
```

**Port 3000 (Frontend):**
```bash
# Try different port
pnpm dev -- -p 3001
```

**Port 8000 (AI):**
```bash
python -m uvicorn api:app --port 8001
# Then update appsettings.json
```

### ❌ CORS Errors in Frontend

Check backend `Program.cs`:
```csharp
app.UseCors("AllowFrontend");
```

If missing, restart backend after verifying Program.cs

### ❌ Frontend Can't Reach Backend

Check `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5284
```

Restart frontend after change

### ❌ Backend Can't Reach AI Service

Check `appsettings.json`:
```json
"AiService": {
  "BaseUrl": "http://localhost:8000",
  "TimeoutSeconds": "60"
}
```

### ❌ Database Connection Error

**Windows (SQL Server):**
```
Server=.\\SQLEXPRESS;Database=ProjectVulnDb;...
```

**Verify SQL Server is running:**
- Services → Find "SQL Server"
- Or use LocalDB

**For development (SQLite):**
- Backend auto-creates `ProjectVuln.db` in dev mode

### ❌ Python Dependencies Error

```bash
# Clear pip cache
pip cache purge

# Reinstall
pip install --upgrade -r requirements.txt

# Check torch installation
python -c "import torch; print(torch.__version__)"
```

---

## 📊 File Changes Summary

| File | Status | Changes |
|------|--------|---------|
| `Program.cs` | ✅ Updated | CORS, DI, Middleware, Logging |
| `CodeScansController.cs` | ✅ Updated | Full endpoints with errors |
| `appsettings.json` | ✅ Updated | Service URLs, Rate limits |
| `ErrorHandlingMiddleware.cs` | ✅ Updated | Global error handling |
| `RateLimitingMiddleware.cs` | ✅ Updated | Rate limiting per IP |
| `lib/api/client.ts` | ✅ Updated | Axios with interceptors |
| `lib/api/types.ts` | ✅ Updated | TypeScript types |
| `scans/page.tsx` | ✅ Updated | Data fetching hooks |
| `.env.local` | ✅ Updated | API URLs |
| `api.py` | ✅ Updated | CORS, Health check, Logging |
| `requirements.txt` | ✅ Updated | Versions pinned |

---

## 🔗 API Endpoints

### Backend (`https://localhost:5284`)

```
POST   /api/codescans           → Create scan
GET    /api/codescans           → List all scans
GET    /api/codescans/{id}      → Get scan by ID
DELETE /api/codescans/{id}      → Delete scan
```

### AI Service (`http://localhost:8000`)

```
GET  /health    → Health check
POST /scan      → Scan code for vulnerabilities
```

---

## 📝 Example Requests

### Create Scan
```bash
curl -X POST https://localhost:5284/api/codescans \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "type": 0,
    "code": "import os\npassword = os.environ.get(\"DB_PASSWORD\")",
    "branch": "main"
  }'
```

### Get All Scans
```bash
curl -X GET "https://localhost:5284/api/codescans?page=1&pageSize=10" \
  -H "Content-Type: application/json" \
  -k
```

### AI Scan (Direct)
```bash
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"code": "import os\npassword = os.environ.get(\"DB_PASSWORD\")"}'
```

---

## 🚀 Accessing Services

| Service | URL | Docs |
|---------|-----|------|
| Frontend | http://localhost:3000 | - |
| Backend | https://localhost:5284 | https://localhost:5284/swagger |
| AI | http://localhost:8000 | http://localhost:8000/docs |

---

## 📚 Full Documentation

- **Detailed Guide:** See [CONNECTION_GUIDE.md](CONNECTION_GUIDE.md)
- **Architecture:** See [INTEGRATION_COMPLETE.md](INTEGRATION_COMPLETE.md)
- **Troubleshooting:** See [CONNECTION_GUIDE.md#6-troubleshooting](CONNECTION_GUIDE.md#6-troubleshooting)

---

**🎉 All set! Start with Terminal commands above**
