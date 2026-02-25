using Microsoft.AspNetCore.Mvc;
using ProjectVuln.Application.DTO;
using ProjectVuln.Application.Interfaces;
using ProjectVuln.Application.Result;

namespace ProjectVuln.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class CodeScansController : ControllerBase
    {
        private readonly ICodeScanService _codeScanService;
        private readonly ILogger<CodeScansController> _logger;

        public CodeScansController(ICodeScanService codeScanService, ILogger<CodeScansController> logger)
        {
            _codeScanService = codeScanService;
            _logger = logger;
        }

        /// <summary>
        /// Create a new code scan for vulnerability detection
        /// </summary>
        /// <param name="request">Scan request containing code or repository URL</param>
        /// <response code="201">Scan created successfully</response>
        /// <response code="400">Invalid request</response>
        /// <response code="500">Server error</response>
        [HttpPost]
        [ProducesResponseType(typeof(ScanResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateScan([FromBody] ScanRequest request)
        {
            try
            {
                _logger.LogInformation($"Creating new scan. Type: {request?.Type}");

                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid model state for scan creation");
                    return BadRequest(new { success = false, error = "Invalid request", errors = ModelState });
                }

                ServiceResult<ScanResponse> result = await _codeScanService.CreateScanAsync(request);

                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to create scan: {result.Message}");
                    return StatusCode(result.StatusCode, new { success = false, error = result.Message });
                }

                _logger.LogInformation($"Scan created successfully with ID: {result.Data?.Id}");
                return CreatedAtAction(nameof(GetScan), new { id = result.Data?.Id }, 
                    new { success = true, data = result.Data, message = "Scan queued for processing" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating scan: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
            }
        }

        /// <summary>
        /// Get a specific scan by ID
        /// </summary>
        /// <param name="id">Scan ID (GUID)</param>
        /// <response code="200">Scan found and returned</response>
        /// <response code="404">Scan not found</response>
        /// <response code="500">Server error</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ScanResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetScan(Guid id)
        {
            try
            {
                _logger.LogInformation($"Retrieving scan: {id}");

                ServiceResult<ScanResponse> result = await _codeScanService.GetScanAsync(id);

                if (!result.Success)
                {
                    _logger.LogWarning($"Scan not found: {id}");
                    return StatusCode(result.StatusCode, new { success = false, error = result.Message });
                }

                _logger.LogInformation($"Scan retrieved successfully: {id}");
                return Ok(new { success = true, data = result.Data });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving scan {id}: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
            }
        }

        /// <summary>
        /// Get all scans with optional filtering and pagination
        /// </summary>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 10, max: 100)</param>
        /// <response code="200">Scans retrieved</response>
        /// <response code="500">Server error</response>
        [HttpGet]
        [ProducesResponseType(typeof(List<ScanResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllScans([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation($"Retrieving all scans. Page: {page}, PageSize: {pageSize}");

                // Validate pagination parameters
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                ServiceResult<List<ScanResponse>> result = await _codeScanService.GetAllScansAsync();

                if (!result.Success)
                {
                    _logger.LogWarning($"Failed to retrieve scans: {result.Message}");
                    return StatusCode(result.StatusCode, new { success = false, error = result.Message });
                }

                _logger.LogInformation($"Retrieved {result.Data?.Count ?? 0} scans");
                return Ok(new { success = true, data = result.Data, page, pageSize });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving scans: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
            }
        }

        /// <summary>
        /// Delete a scan by ID
        /// </summary>
        /// <param name="id">Scan ID (GUID)</param>
        /// <response code="200">Scan deleted</response>
        /// <response code="404">Scan not found</response>
        /// <response code="500">Server error</response>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteScan(Guid id)
        {
            try
            {
                _logger.LogInformation($"Deleting scan: {id}");

                // Note: You may need to implement DeleteScanAsync in your service
                _logger.LogWarning($"DeleteScan not implemented yet");
                return StatusCode(501, new { success = false, error = "Delete functionality not implemented" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting scan {id}: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { success = false, error = "Internal server error", detail = ex.Message });
            }
        }
    }
}
