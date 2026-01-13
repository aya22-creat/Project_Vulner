using System.Text;
using System.Text.Json;
using ProjectVuln.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace ProjectVuln.Application.Services
{
    public class AiScanner : IAiScanner
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<AiScanner> _logger;
    
        private const string BaseUrl = "";// write a port or http://localhost:port da mkan domain server 

        public AiScanner(HttpClient httpClient, ILogger<AiScanner> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<(bool HasVulnerabilities, string RawResponse, double ConfidenceScore)> ScanCodeAsync(string code)
        {
            try
            {
                var payload = new { code = code };
                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync($"{BaseUrl}/scan", content);
                response.EnsureSuccessStatusCode();

                var responseString = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(responseString);

                string label = result.GetProperty("label").GetString();
                double confidence = result.GetProperty("confidence").GetDouble();

                return (label == "VULN", responseString, confidence);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scanning code");
                return (false, JsonSerializer.Serialize(new { error = ex.Message }), 0);
            }
        }

        public async Task<(bool HasVulnerabilities, string RawResponse, double ConfidenceScore)> ScanRepoAsync(string repoPath)
        {
             var files = Directory.GetFiles(repoPath, "*.*", SearchOption.AllDirectories)
                .Where(s => s.EndsWith(".c") || s.EndsWith(".cpp") || s.EndsWith(".h") || s.EndsWith(".hpp"));
            
            bool anyVuln = false;
            double maxConfidence = 0;
            var fileResults = new List<object>();

            foreach (var file in files)
            {
                var code = await File.ReadAllTextAsync(file);
                if (string.IsNullOrWhiteSpace(code)) continue;

                var fileName = Path.GetFileName(file);

                // Limit code size to avoid issues with the model if files are huge
                if (code.Length > 100000) 
                {
                    fileResults.Add(new { file = fileName, status = "skipped_too_large" });
                    continue;
                }

                var (isVuln, raw, conf) = await ScanCodeAsync(code);
                
                fileResults.Add(new 
                { 
                    file = fileName, 
                    isVulnerable = isVuln, 
                    confidence = conf 
                });
                
                if (isVuln)
                {
                    anyVuln = true;
                    if (conf > maxConfidence) maxConfidence = conf;
                }
            }

            if (!files.Any())
            {
                fileResults.Add(new { message = "No C/C++ files found in the repository." });
            }

            string finalRawResponse = JsonSerializer.Serialize(fileResults);

            return (anyVuln, finalRawResponse, maxConfidence);
        }
    }
}
