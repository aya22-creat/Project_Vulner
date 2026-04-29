# 🎉 Project Vulner - Complete Setup Guide

**Date:** April 29, 2026  
**Status:** ✅ ALL SERVICES RUNNING AND CONFIGURED

---

## 📋 TABLE OF CONTENTS
1. [Service Status](#service-status)
2. [User Credentials](#user-credentials)
3. [Access URLs](#access-urls)
4. [Running Services](#running-services)
5. [ZAP Security Tool](#zap-security-tool)
6. [User Account Creation](#user-account-creation)
7. [Testing the System](#testing-the-system)

---

## ✅ SERVICE STATUS

| Service | Port | Status | Details |
|---------|------|--------|---------|
| **Backend API (.NET)** | 5284 | ✅ **RUNNING** | ASP.NET Core, SQLite DB |
| **Frontend (Next.js)** | 3000 | ✅ **RUNNING** | React + TypeScript + Tailwind |
| **AI Service (Python)** | 8000 | ⏳ Ready | FastAPI ML inference (optional) |
| **OWASP ZAP** | 8080 | ✅ **INSTALLED** | Security scanning tool |
| **Hangfire Dashboard** | 5284/hangfire | ✅ Available | Background job monitoring |

---

## 🔐 USER CREDENTIALS

### **ADMIN ACCOUNT**
```
Email:    admin@codescan.io
Password: admin123
Role:     Administrator
Access:   Full system access, user management, all features
```

### **REGULAR USER ACCOUNT**
```
Email:    user@codescan.io
Password: user123
Role:     Developer
Access:   Create and manage scans, limited features
```

### **HOW TO CREATE ADDITIONAL USERS**

#### Option 1: Via REST API (Recommended)
```bash
# Register new user
curl -X POST http://localhost:5284/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User Name",
    "password": "securepassword123",
    "isDeveloper": true
  }'

# Login (get user info)
curl -X POST http://localhost:5284/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepassword123"
  }'

# Get all users
curl http://localhost:5284/api/users
```

#### Option 2: Via Database (Direct)
```bash
# Access using SQLite
cd /home/darrag/التنزيلات/Project_Vulner/ProjectVuln.API
sqlite3 ProjectVuln.db

# View users
SELECT * FROM "Users";

# Insert new user manually
INSERT INTO "Users" 
VALUES (?, ?, ?, ?, ?, ?, datetime('now'));
```

---

## 📍 ACCESS URLS

### **Frontend Application**
- **URL:** http://localhost:3000
- **Access:** Open in web browser
- **Login:** Use admin@codescan.io / admin123

### **Backend API**
- **Base URL:** http://localhost:5284
- **API Docs:** http://localhost:5284/scalar/v1
- **Health Check:** http://localhost:5284/api/codescans

### **Hangfire Dashboard** (Background Jobs)
- **URL:** http://localhost:5284/hangfire
- **Monitor:** Recurring scan jobs, scan processing status

### **OWASP ZAP** (Security Scanning)
- **URL:** http://localhost:8080
- **Status:** Installed, ready to use
- **Use Case:** Live website vulnerability scanning

---

## 🚀 RUNNING SERVICES

### **Start Backend**
```bash
cd /home/darrag/التنزیلات/Project_Vulner/ProjectVuln.API
dotnet run --launch-profile "http"
```
Expected output: `Now listening on: http://localhost:5284`

### **Start Frontend**
```bash
cd /home/darrag/التنزیلات/Project_Vulner/code-scan-api
npm install --legacy-peer-deps  # If first time
npm run dev
```
Expected output: `Local: http://localhost:3000`

### **Start AI Service** (Optional)
```bash
cd /home/darrag/التنزیلات/Project_Vulner/ProjectVuln.AI
python -m uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```
Expected output: `Uvicorn running on http://0.0.0.0:8000`

### **Start ZAP** (Security Tool)
```bash
# Launch ZAP UI
flatpak run org.zaproxy.ZAP

# Or start as daemon for API use
flatpak run org.zaproxy.ZAP -cmd -port 8080 -dir /tmp/zap_home
```

---

## 🔒 OWASP ZAP SECURITY TOOL

### **Installation Status**
✅ **INSTALLED** via Flatpak  
Location: `org.zaproxy.ZAP`

### **Features Available**
- 🔍 **Live Website Scanning** - Scan websites for vulnerabilities
- 🎯 **Passive Scanning** - Analyze website security without active exploits
- 🚨 **Vulnerability Detection** - Identify OWASP Top 10 issues
- 📊 **Detailed Reports** - Export findings with solutions

### **How to Use ZAP with Project Vulner**

#### Step 1: Start ZAP Service
```bash
flatpak run org.zaproxy.ZAP -cmd -port 8080 -dir /tmp/zap_home
```

#### Step 2: Create a Live Scan in Frontend
1. Navigate to http://localhost:3000
2. Click "New Scan" → "Live Scan" tab
3. Enter target URL (e.g., `https://example.com`)
4. Click "Start Vulnerability Scan"

#### Step 3: View Results
- Backend calls ZAP API
- Scans website automatically
- Results displayed in frontend UI
- Shows High/Medium/Low vulnerabilities

### **ZAP API Endpoints Used**
```
POST   /JSON/ascan/action/scan/      - Start scan
GET    /JSON/ascan/view/status/      - Check progress
GET    /JSON/core/view/alerts/       - Get  findings
```

---

## 👥 USER ACCOUNT CREATION

### **API Endpoints for User Management**

#### **Register New User**
```
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Full Name",
  "password": "password123",
  "isDeveloper": true/false
}

Response 200:
{
  "message": "User registered successfully",
  "userId": "guid-here",
  "email": "user@example.com"
}
```

#### **Login User**
```
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response 200:
{
  "message": "Login successful",
  "userId": "guid-here",
  "email": "user@example.com",
  "name": "User Full Name",
  "isDeveloper": true
}
```

#### **Get All Users**
```
GET /api/users

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "guid",
      "name": "Admin User",
      "email": "admin@codescan.io",
      "isDeveloper": true,
      "createdAt": "2026-04-29T..."
    }
  ]
}
```

#### **Get Specific User**
```
GET /api/users/{userId}

Response 200:
{
  "success": true,
  "data": {
    "id": "guid",
    "name": "User Name",
    "email": "user@example.com",
    "isDeveloper": true,
    "createdAt": "2026-04-29T..."
  }
}
```

### **Password Security**
- All passwords are hashed using SHA256
- Never stored in plain text
- Verified during login

---

## 🧪 TESTING THE SYSTEM

### **Test 1: Backend Health Check**
```bash
curl http://localhost:5284/api/codescans
# Expected: JSON array of scans
```

### **Test 2: Register Admin User**
```bash
curl -X POST http://localhost:5284/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@codescan.io",
    "name": "Admin User",
    "password": "admin123",
    "isDeveloper": true
  }'
```

### **Test 3: Register Regular User**
```bash
curl -X POST http://localhost:5284/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@codescan.io",
    "name": "Regular User",
    "password": "user123",
    "isDeveloper": false
  }'
```

### **Test 4: Login**
```bash
curl -X POST http://localhost:5284/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@codescan.io",
    "password": "admin123"
  }'
```

### **Test 5: View All Users**
```bash
curl http://localhost:5284/api/users
```

### **Test 6: Create a Code Scan**
```bash
curl -X POST http://localhost:5284/api/codescans \
  -H "Content-Type: application/json" \
  -d '{
    "type": 0,
    "code": "SELECT * FROM users; DROP TABLE users;",
    "userId": "admin-guid"
  }'
```

### **Test 7: Create a Live Scan (Website)**
```bash
curl -X POST http://localhost:5284/api/codescans \
  -H "Content-Type: application/json" \
  -d '{
    "type": 1,
    "targetUrl": "https://example.com",
    "userId": "admin-guid"
  }'
```

---

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                         │
│              Next.js on Port 3000                       │
│  - Dashboard (view all scans, stats)                   │
│  - New Scan (code or website)                          │
│  - Scan Results (vulnerabilities)                      │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP/REST
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   BACKEND API                            │
│           ASP.NET Core on Port 5284                     │
│  - User Management (/api/users)                        │
│  - Code Scans (/api/codescans)                         │
│  - Dashboard Stats (/api/dashboard)                    │
│  - Hangfire Jobs                                        │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┬──────────────┐
        ▼                       ▼              ▼
    DATABASE             AI SERVICE          ZAP TOOL
  (SQLite)            (Python Port 8000)  (Port 8080)
  ProjectVuln.db      FastAPI ML inference  Security Scanner
```

---

## 🔧 TROUBLESHOOTING

### **Backend Not Responding**
```bash
# Check if port 5284 is in use
lsof -i :5284
# Kill and restart
pkill -f "dotnet run"
cd ProjectVuln.API && dotnet run --launch-profile "http"
```

### **Frontend Not Loading**
```bash
# Check dependencies
cd code-scan-api
npm install --legacy-peer-deps
npm run dev
```

### **Database Issues**
```bash
# Reset database
rm ProjectVuln.API/ProjectVuln.db*
cd ProjectVuln.API
dotnet run  # Will recreate DB with migrations
```

### **ZAP Connection Error**
```bash
# Start ZAP daemon
flatpak run org.zaproxy.ZAP -cmd -port 8080 -dir /tmp/zap_home

# Verify connection
curl http://localhost:8080/JSON/core/action/version/
```

---

## 📝 NOTES

- ✅ All services have SSL/HTTPS disabled for local development
- ✅ Database uses SQLite for development (fast, no setup needed)
- ✅ Background jobs run every minute via Hangfire
- ✅ CORS configured to allow frontend requests
- ✅ Rate limiting: 100 requests/minute, 1000 requests/hour
- ✅ Max file size: 1MB, Max repo size: 100MB

---

## 🎯 NEXT STEPS

1. **Access the Frontend**
   - Go to http://localhost:3000
   - Login with admin@codescan.io / admin123

2. **Create Additional Users** (if needed)
   - Use the API endpoints documented above
   - Or access /api/users in backend

3. **Create Your First Scan**
   - New Scan → Code Scan → Paste code → Submit
   - View results in Scan Details page

4. **Try Live Website Scanning**
   - Make sure ZAP is running
   - New Scan → Live Scan → Enter URL → Submit
   - Results show in ZAP Results Viewer

5. **Monitor Background Jobs**
   - Visit http://localhost:5284/hangfire
   - Watch scan processing in real time

---

**📧 Support:** For issues or questions, refer to the README.md or documentation files.

**🔗 Links:**
- Project Git: Check .git directory
- API Docs: http://localhost:5284/scalar/v1
- Frontend: http://localhost:3000
- Backend Admin: http://localhost:5284/hangfire

---

**Last Updated:** April 29, 2026  
**System Status:** ✅ FULLY OPERATIONAL
