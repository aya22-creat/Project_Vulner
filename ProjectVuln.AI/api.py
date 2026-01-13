from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from inference import predict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Vulnerability AI Scanner",
    description="API for detecting code vulnerabilities"
)

class ScanRequest(BaseModel):
    code: str = Field(..., min_length=1, max_length=100000, description="Source code to analyze")

class ScanResponse(BaseModel):
    label: str
    confidence: float

@app.post("/scan", response_model=ScanResponse)
async def scan_code(req: ScanRequest):
    """
    Scan code for vulnerabilities.
    
    Args:
        req: Request containing the code string to analyze
        
    Returns:
        ScanResponse with vulnerability label and confidence score
    """
    try:
        # Validate input
        if not req.code or not req.code.strip():
            raise HTTPException(status_code=400, detail="Code cannot be empty")
        
        # Get prediction
        result = predict(req.code)
        
        logger.info(f"Scan completed: {result['label']} (confidence: {result['confidence']:.2f})")
        return ScanResponse(**result)
    
    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
