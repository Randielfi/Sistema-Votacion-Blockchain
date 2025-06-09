using backend.Data;
using backend.Helpers;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VoteController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly BlockchainService _blockchain;
        private const bool USE_LOCAL_SIGNING = false; // Cambiar a true para pruebas locales

        public VoteController(ApplicationDbContext context, BlockchainService blockchain)
        {
            _context = context;
            _blockchain = blockchain;
        }

        [HttpPost("submit")]
        [Authorize]
        public async Task<IActionResult> SubmitVote([FromBody] VoteRequest request)
        {
            var userRole = User.FindFirst("role")?.Value;

            if (userRole != "Voter")
            {
                return ApiError.Forbid("Solo los votantes pueden emitir votos.");
            }

            if (string.IsNullOrEmpty(request.Wallet) || request.CandidateId <= 0 || request.ElectionId < 0)
                return ApiError.BadRequest("Faltan datos.");

            // Validar que la elección existe localmente
            var election = await _context.Elections.FirstOrDefaultAsync(e => e.ElectionIdOnChain == request.ElectionId);
            if (election == null)
                return ApiError.BadRequest("La elección no está registrada localmente.");

            // Verificar estado actual en blockchain
            var status = await _blockchain.GetElectionStatusAsync(request.ElectionId);
            if (status is not null)
            {
                var startedObj = status.GetType().GetProperty("Started")?.GetValue(status);
                var endedObj = status.GetType().GetProperty("Ended")?.GetValue(status);

                bool started = startedObj != null && (bool)startedObj;
                bool ended = endedObj != null && (bool)endedObj;

                if (!started || ended)
                    return ApiError.BadRequest("La elección no está activa actualmente.");
            }

            // Obtener ElectionCandidate correctamente
            var electionCandidate = await _context.ElectionCandidates
                .Where(ec => ec.IdEleccion == election.IdEleccion && ec.IdCandidato == request.CandidateId)
                .FirstOrDefaultAsync();

            if (electionCandidate == null)
                return ApiError.BadRequest("El candidato no pertenece a esta elección.");

            var candidateIndex = electionCandidate.CandidateIndex;

            // Validar que la wallet no haya votado en la blockchain (protegemos doble voto)
            var yaVotoOnChain = await _blockchain.HasAddressVotedAsync(election.ElectionIdOnChain, request.Wallet);
            if (yaVotoOnChain)
                return ApiError.BadRequest("Esta wallet ya ha votado en la cadena.");

            string result;

            if (USE_LOCAL_SIGNING)
            {
                // Enviamos CandidateIndex, no CandidateId
                result = await _blockchain.VoteForAsync(election.ElectionIdOnChain, request.Wallet, candidateIndex);
            }
            else
            {
                result = "success";
            }

            if (result == "candidate_not_found")
                return ApiError.BadRequest("Candidato no encontrado en la cadena.");

            if (result == "contract_rejected")
                return ApiError.ServerError("El contrato rechazó el voto.");

            if (result == "error")
                return ApiError.ServerError("Error al emitir el voto en la cadena.");

            // Guardar el voto en base de datos (sin romper anonimato)
            _context.Votes.Add(new Vote
            {
                IdEleccion = election.IdEleccion,
                Timestamp = DateTime.UtcNow
                // Si más adelante usas commit-reveal: IntegrityHash = request.IntegrityHash
            });

            await _context.SaveChangesAsync();

            return Ok(new { message = "Voto registrado correctamente." });
        }

        [HttpGet("has-voted")]
        public async Task<IActionResult> HasVoted([FromQuery] uint electionId, [FromQuery] string wallet)
        {
            if (string.IsNullOrEmpty(wallet) || electionId <= 0)
                return ApiError.BadRequest("Parámetros inválidos.");

            var exists = await _context.Elections.AnyAsync(e => e.ElectionIdOnChain == electionId);
            if (!exists)
                return ApiError.NotFound("La elección no está registrada localmente.");

            var hasVotedChain = await _blockchain.HasAddressVotedAsync(electionId, wallet);

            return Ok(new
            {
                electionId,
                wallet,
                hasVoted = hasVotedChain
            });
        }

    }

    // Modelo de request para votar
    public class VoteRequest
    {
        public string Wallet { get; set; }
        public int CandidateId { get; set; } //  CandidateId (IdCandidato en BD)
        public uint ElectionId { get; set; }  //  ElectionIdOnChain
    }
}
