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

    // [HttpPost]
    // public ActionResult<Dataset> Create(Dataset dataset)
    // {
    //     _datasets.Add(dataset);
    //     Console.WriteLine(dataset.Domain + " \n"+ dataset.Name+" \n"+ dataset.Id);
    //     return CreatedAtAction(nameof(GetAll), new { id = dataset.Id }, dataset);
    // }
}
