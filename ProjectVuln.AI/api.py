from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from inference import predict
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('ai_api.log')
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vulnerability AI Scanner",
    description="API for detecting code vulnerabilities using AI",
    version="1.0.0"
)

# ============================================
# CORS Configuration - Allow Backend Access
# ============================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5284",
        "http://localhost:5000",
        "http://127.0.0.1:5284",
        "http://127.0.0.1:5000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Request/Response Models
# ============================================

class ScanRequest(BaseModel):
    """Request model for code vulnerability scanning"""
    code: str = Field(..., min_length=1, max_length=100000, description="Source code to analyze")
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": "import os\npassword = os.environ.get('DB_PASSWORD')"
            }
        }

class ScanResponse(BaseModel):
    """Response model for scan results"""
    label: str = Field(..., description="Vulnerability classification (vulnerable, safe)")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "label": "vulnerable",
                "confidence": 0.95
            }
        }

class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")

# ============================================
# Health Check Endpoint
# ============================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint to verify AI service is running
    
    Returns:
        HealthResponse with status and version
    """
    logger.info("Health check requested")
    return HealthResponse(status="healthy", version="1.0.0")

# ============================================
# Scan Endpoint
# ============================================

@app.post("/scan", response_model=ScanResponse)
async def scan_code(req: ScanRequest):
    """
    Scan code for vulnerabilities using AI model.
    
    Args:
        req: Request containing the code string to analyze
        
    Returns:
        ScanResponse with vulnerability label and confidence score
        
    Raises:
        HTTPException: If validation or prediction fails
    """
    try:
        # Validate input
        if not req.code or not req.code.strip():
            logger.warning("Received empty code in scan request")
            raise HTTPException(status_code=400, detail="Code cannot be empty")
        
        logger.info(f"Starting scan for code (length: {len(req.code)} chars)")
        
        # Get prediction from AI model
        result = predict(req.code)
        
        # Validate result
        if not result or "label" not in result or "confidence" not in result:
            logger.error("Invalid prediction result from model")
            raise HTTPException(status_code=500, detail="Invalid model output")
        
        logger.info(f"Scan completed: {result['label']} (confidence: {result['confidence']:.2f})")
        
        return ScanResponse(**result)
    
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Validation error: {str(e)}")
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error during prediction: {str(e)}"
        )

# ============================================
# Root Endpoint
# ============================================

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Vulnerability AI Scanner",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "scan": "/scan",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

# ============================================
# Exception Handlers
# ============================================

@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    """Handle unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return {
        "success": False,
        "error": "Internal server error",
        "detail": str(exc)
    }

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Vulnerability AI Scanner API...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
