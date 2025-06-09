using backend.Data;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CandidateController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST /api/candidate
        [HttpPost]
        public async Task<IActionResult> CreateCandidate([FromBody] CreateCandidateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Nombres) || string.IsNullOrWhiteSpace(request.Apellidos))
                return ApiError.BadRequest("Nombre y apellido son obligatorios.");

            var candidate = new Candidate
            {
                Nombres = request.Nombres,
                Apellidos = request.Apellidos
            };

            _context.Candidates.Add(candidate);
            await _context.SaveChangesAsync();

            return Ok(candidate);
        }

        // GET /api/candidate
        [HttpGet]
        public async Task<IActionResult> GetAllCandidates()
        {
            var candidates = await _context.Candidates
                .Select(c => new
                {
                    c.IdCandidato,
                    c.Nombres,
                    c.Apellidos
                })
                .ToListAsync();

            return Ok(candidates);
        }

        // GET /api/candidate/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCandidate(int id)
        {
            var candidate = await _context.Candidates
                .Where(c => c.IdCandidato == id)
                .Select(c => new
                {
                    c.IdCandidato,
                    c.Nombres,
                    c.Apellidos
                })
                .FirstOrDefaultAsync();

            if (candidate == null)
                return ApiError.NotFound("Candidato no encontrado.");

            return Ok(candidate);
        }
    }

    // Modelo para crear candidato
    public class CreateCandidateRequest
    {
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
    }
}
