# Project Vulner - Full Connection Guide

## Overview
This guide explains how all three components (Frontend, Backend, AI Model) communicate with each other.

## Architecture

```
Frontend (Next.js/React/TypeScript)
    ↓↑
Backend (.NET 9 C#)
    ↓↑
AI Model (Python/FastAPI)
```

---

## 1. FRONTEND CONFIGURATION

### Location: `/code-scan-api`

#### Environment Setup
**File:** `.env.local`
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5284
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:8000
```

#### API Client Configuration
**File:** `lib/api/client.ts`
- Base URL: `http://localhost:5284` (Backend API)
- Timeout: 30 seconds
- Error handling with console logging
- Automatic retry on network errors

#### API Endpoints
All requests go to: `http://localhost:5284/api/codescans`

**Available Endpoints:**
- `POST /api/codescans` - Create new scan
- `GET /api/codescans` - Get all scans (with pagination)
- `GET /api/codescans/{id}` - Get specific scan
- `DELETE /api/codescans/{id}` - Delete scan

#### Type Definitions
**File:** `lib/api/types.ts`

```typescript
// Request to create a scan
interface ScanRequest {
  type: ScanType (0=Code, 1=RepoUrl)
  code?: string (required if type=0)
  repoUrl?: string (required if type=1)
  branch?: string
}

// Response from API
interface ScanResponse {
  id: string (GUID)
  type: ScanType
  status: ScanStatus (0=Pending, 1=Running, 2=Completed, 3=Failed)
  hasVulnerabilities?: boolean
  confidenceScore?: number (0-1)
  createdAt: string (ISO 8601)
}
```

---

## 2. BACKEND CONFIGURATION

### Location: `/ProjectVuln.API`

#### Port Configuration
- **Development:** `https://localhost:5284` (HTTP redirects to HTTPS)
- **Production:** Configurable via appsettings.json

#### CORS Setup
**File:** `Program.cs`

Allowed Origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

To add more origins, modify `AllowFrontend` policy in `Program.cs`

#### Database Configuration
**File:** `appsettings.json`

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.\\SQLEXPRESS;Database=ProjectVulnDb;Trusted_Connection=True;..."
}
```

- **Development:** SQLite (`ProjectVuln.db`)
- **Production:** SQL Server

#### AI Service Integration
**File:** `appsettings.json`

```json
"AiService": {
  "BaseUrl": "http://localhost:8000",
  "TimeoutSeconds": "60",
  "RetryAttempts": 3
}
```

#### Rate Limiting
**File:** `appsettings.json`

```json
"RateLimiting": {
  "RequestsPerMinute": "100",
  "RequestsPerHour": "1000"
}
```

#### Middleware Stack
1. **CORS** - Enables cross-origin requests
2. **Error Handling** - Global exception handling
3. **Rate Limiting** - Prevents abuse
4. **Authentication** - Authorization checks

#### API Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": 0,
    "status": 0,
    "createdAt": "2024-01-17T10:30:00Z"
  },
  "message": "Scan created successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400,
  "traceId": "0HMVF8C0JEL3L:00000001"
}
```

---

## 3. AI SERVICE CONFIGURATION

### Location: `/ProjectVuln.AI`

#### Server Configuration
- **Host:** `0.0.0.0`
- **Port:** `8000`
- **Base URL:** `http://localhost:8000`

#### CORS Setup
**File:** `api.py`

Allowed Origins:
- `http://localhost:5284` (Backend)
- `http://localhost:5000`
- `http://127.0.0.1:5284`
- `http://127.0.0.1:5000`

#### Health Check Endpoint
```
GET http://localhost:8000/health

Response:
{
  "status": "healthy",
  "version": "1.0.0"
}
```

#### Scan Endpoint

**Request:**
```
POST http://localhost:8000/scan

Body:
{
  "code": "import os\npassword = os.environ.get('DB_PASSWORD')"
}
```

**Response:**
```json
{
  "label": "vulnerable",
  "confidence": 0.95
}
```

---

## 4. RUNNING THE APPLICATION

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- Python 3.9+
- PostgreSQL or SQL Server

### Step 1: Start Python AI Service

```bash
cd ProjectVuln.AI

# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start .NET Backend

```bash
cd ProjectVuln.API

# Restore dependencies
dotnet restore

# Run the server
dotnet run
```

Expected output:
```
✓ API Server starting on https://localhost:5284
```

### Step 3: Start Next.js Frontend

```bash
cd code-scan-api

# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

Expected output:
```
▲ Next.js starts on http://localhost:3000
```

---

## 5. TESTING THE CONNECTION

### Test Backend Health
```bash
curl -X GET https://localhost:5284/api/codescans \
  -H "Content-Type: application/json" \
  -k  # Skip SSL certificate verification for local development
```

### Test AI Service Health
```bash
curl -X GET http://localhost:8000/health
```

### Test Complete Flow

1. **Create a scan via Frontend**
   - Navigate to `http://localhost:3000/scans`
   - Click "New Scan"
   - Submit code
   - Monitor Network tab in DevTools

2. **Check Frontend Console Logs**
   - Open DevTools (F12)
   - Console tab
   - Look for `[API]` prefixed messages

3. **Check Backend Logs**
   - Terminal where `.NET` is running
   - Look for request/response logs

4. **Check AI Service Logs**
   - Terminal where `Python` is running
   - Look for prediction logs

---

## 6. TROUBLESHOOTING

### Frontend Can't Connect to Backend

**Error:** `ERR_CONNECTION_REFUSED`

**Solutions:**
1. Check backend is running: `dotnet run` in `ProjectVuln.API`
2. Verify port: Backend should be on `5284`
3. Check firewall: Allow localhost connections
4. Update `.env.local`: Ensure `NEXT_PUBLIC_API_BASE_URL=http://localhost:5284`

### Backend Can't Connect to AI Service

**Error:** `HttpRequestException: Connection refused`

**Solutions:**
1. Check AI service running: `python -m uvicorn api:app ...` in `ProjectVuln.AI`
2. Verify port: AI should be on `8000`
3. Check `appsettings.json`: `AiService.BaseUrl` should be `http://localhost:8000`
4. Add endpoint to health check: `GET http://localhost:8000/health`

### CORS Errors in Frontend

**Error:** `Access to XMLHttpRequest has been blocked by CORS`

**Solutions:**
1. Check backend CORS config in `Program.cs`
2. Add frontend origin to `AllowFrontend` policy
3. Restart backend after changes
4. Clear browser cache (Ctrl+Shift+Delete)

### Rate Limiting Triggered

**Error:** `429 Too Many Requests`

**Solutions:**
1. Wait 60 seconds (or configured duration)
2. Check `appsettings.json` rate limit settings
3. Use different client IP/proxy for testing

### Database Connection Error

**Error:** `SqlException: Cannot connect to database`

**Solutions:**
1. Start SQL Server or PostgreSQL
2. Check connection string in `appsettings.json`
3. Verify database exists
4. Run migrations: `dotnet ef database update`

---

## 7. COMMON OPERATIONS

### Create a Scan
```bash
curl -X POST http://localhost:5284/api/codescans \
  -H "Content-Type: application/json" \
  -d '{
    "type": 0,
    "code": "import os\npassword = os.environ.get(\"DB_PASSWORD\")",
    "branch": "main"
  }'
```

### Get All Scans
```bash
curl -X GET "http://localhost:5284/api/codescans?page=1&pageSize=10" \
  -H "Content-Type: application/json"
```

### Get Single Scan
```bash
curl -X GET http://localhost:5284/api/codescans/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json"
```

### Check AI Model Health
```bash
curl -X GET http://localhost:8000/health
```

### Manual AI Scan (without backend)
```bash
curl -X POST http://localhost:8000/scan \
  -H "Content-Type: application/json" \
  -d '{"code": "import os\npassword = os.environ.get(\"DB_PASSWORD\")"}'
```

---

## 8. LOGS & DEBUGGING

### Frontend Logs
- **Location:** Browser DevTools Console
- **Prefix:** `[API]`, `[Page]`
- **Check:** Network tab for request/response details

### Backend Logs
- **Location:** Terminal running dotnet
- **Level:** Information, Warning, Error
- **File:** (Optional) Configure in `appsettings.json`

### AI Service Logs
- **Location:** Terminal running Python
- **File:** `ai_api.log`
- **Format:** ISO timestamp, level, message

---

## 9. DEPLOYMENT NOTES

### Environment Variables

**Backend (`appsettings.Production.json`):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Production database connection string"
  },
  "AiService": {
    "BaseUrl": "https://ai-service-url.com",
    "ApiKey": "production-api-key"
  }
}
```

**Frontend (`.env.production`):**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.yourdomain.com
```

### HTTPS Setup
- Generate SSL certificates
- Update URLs in all configs
- Configure backend to use HTTPS

### Database Migrations
```bash
dotnet ef database update --configuration Release
```

---

## 10. SUPPORT

For issues or questions:
1. Check the troubleshooting section
2. Review logs in all three services
3. Ensure all services are running
4. Verify network connectivity
5. Check firewall/proxy settings

