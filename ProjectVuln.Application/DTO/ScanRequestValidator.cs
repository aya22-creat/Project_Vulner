using ProjectVuln.Domain.enums;
using System.ComponentModel.DataAnnotations;

namespace ProjectVuln.Application.DTO;

public static class ScanRequestValidator
{
    public static ValidationResult? Validate(ScanRequest request)
    {
        // Validate Type field
        if (request.Type == ScanType.Code && string.IsNullOrWhiteSpace(request.Code))
        {
            return new ValidationResult("Code is required when Type is 'Code'");
        }

        if (request.Type == ScanType.RepoUrl && string.IsNullOrWhiteSpace(request.RepoUrl))
        {
            return new ValidationResult("RepoUrl is required when Type is 'RepoUrl'");
        }

        // Max code length validation
        if (request.Type == ScanType.Code && request.Code != null && request.Code.Length > 100000)
        {
            return new ValidationResult("Code length exceeds maximum limit of 100,000 characters");
        }

        return ValidationResult.Success;
    }
}
