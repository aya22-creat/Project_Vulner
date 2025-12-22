using ProjectVuln.Application.Interfaces;
using ProjectVuln.Domain.entity;

namespace ProjectVuln.Application.Jobs
{
    public class CodeScanJob
    {
        private readonly ICodeScanRepository _repository;

        public CodeScanJob(ICodeScanRepository repository)
        {
            _repository = repository;
        }

        public async Task ExecuteAsync(Guid scanId)
        {
            var scan = await _repository.GetByIdAsync(scanId);
            if (scan == null)
                return;

            try
            {
                scan.Status = ScanStatus.Running;
                await _repository.UpdateAsync(scan);

                // call ai model here .

                //var aiResult = await _aiScanner.ScanAsync(scan);


                //scan.AiRawResponse = aiResult.RawOutput;
                //scan.HasVulnerabilities = aiResult.HasVulnerabilities;
                //scan.ConfidenceScore = aiResult.Confidence;

                scan.AiRawResponse = "Simulated AI scan response.";
                scan.HasVulnerabilities = false;
                scan.ConfidenceScore = 0.95;

                scan.Status = ScanStatus.Completed;
            }
            catch (Exception ex)
            {
                scan.Status = ScanStatus.Failed;
                scan.AiRawResponse = ex.ToString();
            }

            await _repository.UpdateAsync(scan);
        }
    }
}
