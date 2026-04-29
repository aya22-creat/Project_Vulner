# Live Scan (Website Vulnerability Scanning) - Setup Guide

## Overview
The **Live Scan** feature allows users to scan live websites for security vulnerabilities using OWASP ZAP (Zed Attack Proxy). This guide explains how to set up and use the new Live Scan feature.

## What Was Added

### Backend (C# .NET API)
- **Live Scan Support**: CodeScanType now includes `Website` scan type
- **ZAP Integration**: `ProcessWebsiteScanAsync` method handles ZAP scanning
- **Configuration**: ZAP settings in `appsettings.Development.json`
- **Results Storage**: ZAP findings stored in `ResultsJson` field

### Frontend (Next.js / React)
- **New Tab**: "Live Scan" tab added to the Create Scan form with Globe icon
- **URL Input**: Web URL field for specifying target website
- **Results Display**: ZAP Results Viewer component showing:
  - Vulnerability summary (High/Medium/Low counts)
  - Detailed findings with descriptions
  - Solutions for each vulnerability
  - List and detail views

### Database Model
- `TargetUrl`: URL of scanned website
- `ZapScanId`: ID of the ZAP scan
- `ResultsJson`: Structured ZAP results
- `Type = Website`: Scan type identifier

## Quick Setup

### Step 1: Start with Docker Compose (Recommended)
```bash
cd /home/darrag/التنزيلات/Project_Vulner
docker-compose up -d
```

This will start:
- **ZAP Daemon**: `http://localhost:8080`
- **API**: `http://localhost:5284`
- **Frontend**: `http://localhost:3001`
- **AI Service**: `http://localhost:8000`

### Step 2: ZAP Configuration (Already Done)
ZAP daemon is configured to:
- Listen on `http://localhost:8080`
- API disabled key mode (no API key required)
- Auto-updates disabled for faster startup

### Step 3: Backend Configuration (Already Done)
`appsettings.Development.json` contains:
```json
"Zap": {
  "BaseUrl": "http://localhost:8080",
  "ApiKey": "",
  "PollMaxIterations": 120,
  "PollIntervalMs": 2000
}
```

## How to Use Live Scan

### Create a Live Scan
1. Go to **New Scan** page
2. Click the **"Live Scan"** tab (with globe icon)
3. Enter a website URL (e.g., `https://example.com`)
4. Click **"Start Vulnerability Scan"**
5. You'll be redirected to the scan details page

### View Live Scan Results
Once the scan completes:
- **Summary**: Shows High/Medium/Low vulnerability counts
- **Findings List**: All discovered vulnerabilities
- **Details View**: Click any finding to see:
  - Full description
  - Step-by-step solution
  - Affected URL
  - Risk level

## How It Works (Backend Flow)

```
User submits URL
         ↓
Backend creates CodeScan record with Type=Website
         ↓
Background job triggers (Hangfire)
         ↓
ProcessWebsiteScanAsync executes:
  1. Calls ZAP: POST /JSON/ascan/action/scan/?url={url}
  2. Gets scan ID from ZAP response
  3. Polls status: GET /JSON/ascan/view/status/?scanId={scanId}
  4. Waits until scan completes or max polls reached
  5. Fetches alerts: GET /JSON/core/view/alerts/?baseurl={url}
  6. Parses findings and stores in ResultsJson
  7. Updates scan status to Completed
         ↓
Frontend displays ZAP results in WebsiteScanViewer
```

## Frontend Flow

```
User enters URL in Live Scan form
         ↓
Form validates URL format
         ↓
Creates ScanRequest with type=Website, targetUrl={url}
         ↓
POST /api/codescans with request
         ↓
Backend returns scan ID
         ↓
Redirects to /scan/{id}
         ↓
ScanDetails component loads
  - If type=Website and resultsJson exists:
    → Shows ZapResultsViewer
  - Shows vulnerability summary
  - Shows findings list with details
```

## Files Modified/Created

### Backend
- **appsettings.Development.json**: Added ZAP configuration
- **ProjectVuln.Application/Jobs/CodeScanJob.cs**: Already had `ProcessWebsiteScanAsync`
- No new files needed (infrastructure was ready)

### Frontend Types
- **lib/api/types.ts**: Added `ScanType.Website = 2`
- **lib/api/types.ts**: Added `targetUrl` to ScanRequest
- **lib/api/types.ts**: Added ZAP-related fields to ScanResponse

### Frontend Components
- **components/scan/new-scan-form.tsx**: Added Live Scan tab
- **components/scan/scan-details.tsx**: Created - displays scan details
- **components/scan/zap-results-viewer.tsx**: Created - displays ZAP results
- **components/dashboard/recent-scans.tsx**: Updated to show Live Scan type
- **components/scan/all-scans-table.tsx**: Updated to show Live Scan type

### Docker
- **docker-compose.yml**: Added OWASP ZAP service

## Configuration Options

### Backend (appsettings.json)
```json
"Zap": {
  "BaseUrl": "http://localhost:8080",
  "ApiKey": "your-api-key",  // Leave empty for no key requirement
  "PollMaxIterations": 120,   // Max poll attempts
  "PollIntervalMs": 2000      // Wait between polls (ms)
}
```

### Plan Limits
The system includes plan limits for Live Scans (free tier):
```json
"Plans": {
  "TrialMaxScans": 20,        // Total scans limit
  "TrialMaxWebsiteScans": 3   // Website/Live scan limit  
}
```

## Testing Live Scan

### Quick Test
```bash
# 1. Start all services
docker-compose up -d

# 2. Verify ZAP is running
curl http://localhost:8080/JSON/core/view/version/

# 3. Open frontend
# Go to http://localhost:3001

# 4. Create a live scan
# New Scan → Live Scan tab → Enter URL → Start

# 5. Wait for scan to complete (2-30 minutes depending on complexity)
```

### Troubleshooting

**ZAP not responding:**
```bash
docker logs projectvuln-zap
docker restart projectvuln-zap
```

**ZAP API timeouts:**
- Increase `Zap:PollMaxIterations` in appsettings
- Increase `Zap:PollIntervalMs` for slower networks

**Scan status stuck on "Running":**
- Check ZAP logs: `docker logs projectvuln-zap`
- Verify ZAP can reach the target URL
- Some websites may block automated scanning

## Security Notes

⚠️ **Important**: Only scan websites you own or have permission to scan!

- Live scanning can be detected as an attack
- Some websites block ZAP user agents
- Always get permission before security testing
- Results may vary based on target's security configuration

## Performance

- **Small sites** (< 100 pages): 2-5 minutes
- **Medium sites** (100-1000 pages): 10-30 minutes
- **Large sites**: May timeout (consider scanning specific URLs)

## Future Enhancements

Possible additions:
- [ ] Custom scan policies/profiles
- [ ] Recurring scheduled scans
- [ ] Scan authentication support
- [ ] Export reports (PDF/JSON)
- [ ] Integration with CI/CD pipelines
- [ ] Webhook notifications
- [ ] Multi-site scan support

## API Endpoints

### Create Live Scan
```
POST /api/codescans
Content-Type: application/json

{
  "type": 2,
  "targetUrl": "https://example.com"
}
```

### Get Scan Details
```
GET /api/codescans/{scanId}
```

### Get All Scans
```
GET /api/codescans
```

## Support

For issues or questions:
1. Check ZAP logs: `docker logs projectvuln-zap`
2. Verify target URL is accessible
3. Check network connectivity between API and ZAP
4. Review backend logs for detailed errors
