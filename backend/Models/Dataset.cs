namespace StewardIQ.Api.Models;

public class Dataset
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Domain { get; set; } = string.Empty;
    public string Owner { get; set; } = string.Empty;
    public int QualityScore { get; set; }
    public string Status { get; set; } = string.Empty;
}
