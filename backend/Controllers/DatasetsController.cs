using Microsoft.AspNetCore.Mvc;
using StewardIQ.Api.Models;

namespace StewardIQ.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatasetsController : ControllerBase
{
    private static readonly List<Dataset> _datasets = [];

    [HttpGet]
    public ActionResult<IEnumerable<Dataset>> GetAll()
    {
        return Ok(_datasets);
    }

    [HttpPost]
    public ActionResult<Dataset> Create(Dataset dataset)
    {
        _datasets.Add(dataset);
        return CreatedAtAction(nameof(GetAll), new { id = dataset.Id }, dataset);
    }

    [HttpPut("{id}")]
    public ActionResult<Dataset> Update(string id, Dataset dataset)
    {
        var existing = _datasets.FirstOrDefault(d => d.Id == id);
        if (existing is null)
            return NotFound();

        existing.Name = dataset.Name;
        existing.Domain = dataset.Domain;
        existing.Owner = dataset.Owner;
        existing.QualityScore = dataset.QualityScore;
        existing.Status = dataset.Status;
        existing.Details = dataset.Details;

        return Ok(existing);
    }
}
