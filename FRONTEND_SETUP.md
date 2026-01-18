# Full-Stack Setup Guide: CodeScan API

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend                             │
│              Next.js + TypeScript + Tailwind            │
│          (code-scan-api) - Port 3000                    │
│                                                          │
│  ├─ Dashboard (View all scans, stats)                  │
│  ├─ New Scan (Create code or repo scans)              │
│  └─ Scan Details (View results, polling)              │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/REST (Axios)
                   │ API Base: http://localhost:5284
                   ▼
┌─────────────────────────────────────────────────────────┐
│                     Backend API                         │
│            ASP.NET Core (Clean Architecture)           │
│          (ProjectVuln.API) - Port 5284                 │
│                                                          │
│  ├─ POST /api/codescans - Create scan                 │
│  ├─ GET /api/codescans - List all scans               │
│  ├─ GET /api/codescans/{id} - Get scan details        │
│  └─ GET /api/dashboard/stats - Dashboard stats        │
│                                                          │
│  Database: SQLite (Development)                         │
│  File: ProjectVuln.db                                   │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- **Node.js** 18+ (for frontend)
- **.NET 8+** (for backend)
- **Git** (optional, for repo scanning)

## Directory Structure

```
Project_Vulner/
├── ProjectVuln.API/              ← Backend API
├── ProjectVuln.Application/       ← Business Logic
├── ProjectVuln.Domain/            ← Domain Models
├── ProjectVuln.Infrastructure/    ← Database & Services
├── ProjectVuln.Tests/             ← Unit Tests
├── ProjectVuln.AI/                ← AI/ML Module
└── code-scan-api/                 ← Frontend (Next.js)
    ├── .env.local                 ← Environment variables
    ├── app/                       ← Pages & Routes
    ├── components/                ← React Components
    ├── lib/                       ← Utilities & API Client
    └── package.json               ← Dependencies
```

---

## STEP 1: Backend Setup (ASP.NET Core)

### 1.1 Restore Dependencies

```bash
cd Project_Vulner
dotnet restore
```

### 1.2 Build the Project

```bash
dotnet build
```

### 1.3 Run the Backend

```bash
cd ProjectVuln.API
dotnet run --configuration Debug
```

**Expected Output:**
```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5284
      Now listening on: https://localhost:7048
```

✅ Backend is running on: `http://localhost:5284`

### 1.4 Verify Backend is Working

Open browser: `http://localhost:5284/scalar/v1`

You should see the Scalar API documentation with all endpoints.

---

## STEP 2: Frontend Setup (Next.js)

### 2.1 Install Dependencies

Navigate to the frontend folder:

```bash
cd code-scan-api
npm install --legacy-peer-deps
```

**Note:** `--legacy-peer-deps` is needed because React 19 is newer than react-hook-form's requirements.

### 2.2 Verify Environment Configuration

Check `.env.local` file exists:

```bash
cat .env.local
```

**Should contain:**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5284
```

If not, create it:

```bash
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:5284" > .env.local
```

### 2.3 Run the Frontend

```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 16.0.10
  - Local:        http://localhost:3000
  - Environments: .env.local
```

✅ Frontend is running on: `http://localhost:3000`

---

## STEP 3: Running Both Together

### Option A: Two Terminal Windows

**Terminal 1 (Backend):**
```bash
cd Project_Vulner/ProjectVuln.API
dotnet run --configuration Debug
```

**Terminal 2 (Frontend):**
```bash
cd code-scan-api
npm run dev
```

### Option B: Using a Process Manager

If you have `pm2` installed:

```bash
pm2 start "cd Project_Vulner/ProjectVuln.API && dotnet run --configuration Debug" --name "backend"
pm2 start "cd code-scan-api && npm run dev" --name "frontend"
pm2 logs
```

---

## STEP 4: Testing the Integration

### 4.1 Open Frontend

Navigate to: `http://localhost:3000`

### 4.2 Test Dashboard Page

You should see:
- ✅ Total Scans (should be 0 initially)
- ✅ Vulnerable Scans (0)
- ✅ Safe Scans (0)
- ✅ Pending Scans (0)

If you see errors, check browser console (F12) for network errors.

### 4.3 Create a Test Scan

1. Click "New Scan" button
2. Enter test code:
   ```javascript
   const password = "hardcoded123";
   eval(userInput);
   ```
3. Click "Submit"
4. You should see a scan ID returned
5. Status should update in real-time

### 4.4 View Scan Details

- Click on any scan in the dashboard
- Watch status update from "Pending" → "Running" → "Completed"
- View AI vulnerability report when complete

---

## API Endpoints Reference

### Create Scan

```
POST /api/codescans
Content-Type: application/json

{
  "type": 0,  // 0 = Code, 1 = RepoUrl
  "code": "vulnerable code here",
  "branch": "main"  // Optional, defaults to "main"
}

Response:
{
  "id": "uuid",
  "type": 0,
  "status": 1,  // 0=Pending, 1=Running, 2=Completed, 3=Failed
  "createdAt": "2026-01-16T12:00:00Z"
}
```

### Get All Scans

```
GET /api/codescans

Response:
[
  {
    "id": "uuid",
    "type": 0,
    "code": "...",
    "hasVulnerabilities": true,
    "confidenceScore": 0.95,
    "status": 2,
    "createdAt": "2026-01-16T12:00:00Z"
  }
]
```

### Get Single Scan

```
GET /api/codescans/{id}

Response: Same as above (single object)
```

### Get Dashboard Stats

```
GET /api/dashboard/stats

Response:
{
  "totalScans": 10,
  "vulnerableScans": 7,
  "safeScans": 2,
  "pendingScans": 1,
  "recentScans": [...]
}
```

---

## Troubleshooting

### Issue: "API Base URL not connecting"

**Solution:**
```bash
# Verify backend is running on correct port
curl http://localhost:5284/api/codescans

# Check .env.local in frontend
cat code-scan-api/.env.local

# Should output:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5284
```

### Issue: CORS Errors in Browser

**Solution:** CORS is configured in backend. If still getting errors:

```csharp
// In ProjectVuln.API/Program.cs, verify:
app.UseCors("Development");  // Must be before MapControllers()
```

### Issue: Database Error (SQLite not found)

**Solution:**
```bash
cd Project_Vulner/ProjectVuln.API
# Database will auto-create on first run
dotnet run
```

### Issue: npm install fails

**Solution:**
```bash
cd code-scan-api
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Issue: Port 3000 or 5284 already in use

**Backend (change port):**
```bash
dotnet run --urls "http://localhost:5285"
# Then update .env.local in frontend
```

**Frontend (Next.js uses different port automatically):**
```bash
npm run dev -- -p 3001
```

---

## Key Files & Their Purposes

### Backend
- `ProjectVuln.API/Controllers/CodeScansController.cs` - API endpoints
- `ProjectVuln.Application/Services/CodeScanService.cs` - Business logic
- `ProjectVuln.Infrastructure/Data/AppDbContext.cs` - Database context
- `ProjectVuln.Domain/entity/CodeScan.cs` - Data model

### Frontend
- `code-scan-api/.env.local` - Environment variables
- `code-scan-api/lib/api/client.ts` - API client (Axios)
- `code-scan-api/lib/api/types.ts` - TypeScript types
- `code-scan-api/lib/hooks/use-scans.ts` - Data fetching hooks
- `code-scan-api/app/(dashboard)/` - Dashboard pages
- `code-scan-api/components/scan/new-scan-form.tsx` - Scan creation form

---

## What Was Fixed

✅ **Created `.env.local`** with correct API base URL (http://localhost:5284)  
✅ **Updated API client** to use port 5284 instead of 5000  
✅ **Added CORS** configuration in backend for local development  
✅ **Verified API endpoints** match between frontend and backend  
✅ **Type safety** ensured with TypeScript types matching C# DTOs  

---

## Development Workflow

1. **Make API changes** → Restart backend (`dotnet run`)
2. **Make UI changes** → Frontend auto-reloads
3. **View logs** → Backend console for errors, Browser F12 for frontend
4. **Database reset** → Delete `ProjectVuln.db`, restart backend

---

## Production Deployment

### Backend

```bash
dotnet publish -c Release
# Deploy the `bin/Release/net8.0/publish/` folder
```

### Frontend

```bash
npm run build
npm run start
# Or deploy to Vercel/Netlify
```

---

## Support

For issues, check:
1. **Backend logs** - Terminal where `dotnet run` is running
2. **Frontend logs** - Browser Console (F12)
3. **Network tab** - Verify API calls are reaching backend
4. **Database** - Check `ProjectVuln.db` exists in ProjectVuln.API folder

---

**Happy coding! 🚀**
