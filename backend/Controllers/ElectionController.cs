using Microsoft.AspNetCore.Mvc;
using backend.Services;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Helpers;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ElectionController : ControllerBase
    {
        private readonly BlockchainService _blockchain;
        private readonly ApplicationDbContext _context;

        public ElectionController(BlockchainService blockchain, ApplicationDbContext context)
        {
            _blockchain = blockchain;
            _context = context;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartElection([FromBody] StartElectionRequest request)
        {
            Console.WriteLine("Iniciando proceso de creación de elección...");

            if (string.IsNullOrWhiteSpace(request.Title) || request.CandidateIds == null || !request.CandidateIds.Any())
            {
                Console.WriteLine("Datos inválidos para la elección.");
                return ApiError.BadRequest("Debe proporcionar un título y al menos un candidato.");
            }

            Console.WriteLine("Título recibido: " + request.Title);
            Console.WriteLine("CandidateIds recibidos: " + string.Join(", ", request.CandidateIds));

            try
            {
                var candidates = await _context.Candidates
                    .Where(c => request.CandidateIds.Contains(c.IdCandidato))
                    .ToListAsync();

                var candidateNames = candidates
                    .OrderBy(c => request.CandidateIds.IndexOf(c.IdCandidato))
                    .Select(c => c.Nombres + " " + c.Apellidos)
                    .ToList();

                // Iniciar elección en blockchain
                var electionIdOnChain = await _blockchain.StartElectionAsync(request.Title, candidateNames);

                if (electionIdOnChain == 0)
                {
                    Console.WriteLine("? Error al iniciar la elección en la blockchain.");
                    return ApiError.ServerError("Error al iniciar la elección en el contrato.");
                }

                // Guardar la elección en la base de datos
                var election = new Election
                {
                    TituloEleccion = request.Title,
                    ElectionIdOnChain = electionIdOnChain,
                    Iniciada = true,
                    Terminada = false
                };

                _context.Elections.Add(election);
                await _context.SaveChangesAsync();

                for (int i = 0; i < request.CandidateIds.Count; i++)
                {
                    _context.ElectionCandidates.Add(new ElectionCandidate
                    {
                        IdEleccion = election.IdEleccion,
                        IdCandidato = request.CandidateIds[i],
                        CandidateIndex = i
                    });
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"Elección '{request.Title}' creada con ID on-chain {electionIdOnChain}");

                return Ok(new
                {
                    election.IdEleccion,
                    election.TituloEleccion,
                    election.ElectionIdOnChain
                });

            }
            catch (Exception ex)
            {
                Console.WriteLine("Excepción en controlador: " + ex.Message);
                return ApiError.ServerError("Error al procesar la solicitud.");
            }
        }

        [HttpPost("{id}/end")]
        public async Task<IActionResult> EndElection(uint id)
        {
            Console.WriteLine($"Finalizando elección {id}...");

            var success = await _blockchain.EndElectionAsync(id);
            if (!success)
                return ApiError.ServerError($"No se pudo finalizar la elección {id} en la blockchain.");

            var election = await _context.Elections.FirstOrDefaultAsync(e => e.ElectionIdOnChain == id);
            if (election != null)
            {
                election.Terminada = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = $"Elección {id} finalizada correctamente." });
        }


        [HttpGet("{id}/winner")]
        [AllowAnonymous]
        public async Task<IActionResult> GetWinner(uint id)
        {
            var result = await _blockchain.GetWinnerAsync(id);
            if (result == null)
                return ApiError.BadRequest("La elección aún no ha finalizado o no se pudo obtener el ganador.");

            return Ok(result);
        }

        [HttpGet("{id}/results")]
        [AllowAnonymous]
        public async Task<IActionResult> GetResults(uint id)
        {
            var results = await _blockchain.GetResultsAsync(id);
            return Ok(results);
        }

        [HttpGet("{id}/results-with-integrity")]
        [AllowAnonymous]
        public async Task<IActionResult> GetResultsWithIntegrity(uint id)
        {
            var result = await _blockchain.GetResultsWithIntegrityAsync(id);
            return Ok(result);
        }


        [HttpGet("{id}/status")]
        [AllowAnonymous]
        public async Task<IActionResult> GetStatus(uint id)
        {
            var status = await _blockchain.GetElectionStatusAsync(id);
            if (status == null)
            {
                Console.WriteLine($"No se encontró información para la elección {id}");
                return ApiError.NotFound($"No se encontró el estado de la elección con ID {id}");
            }

            return Ok(status);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllElections()
        {
            var list = await _context.Elections
                .Include(e => e.ElectionCandidates)
                    .ThenInclude(ec => ec.Candidate)
                .ToListAsync();

            var response = new List<object>();

            foreach (var e in list)
            {
                dynamic status = await _blockchain.GetElectionStatusAsync(e.ElectionIdOnChain);

                string estadoTexto;
                if (status == null)
                {
                    estadoTexto = "Desconocido";
                }
                else
                {
                    bool started = status.Started;
                    bool ended = status.Ended;

                    if (ended)
                        estadoTexto = "Finalizada";
                    else if (started)
                        estadoTexto = "Activo";
                    else
                        estadoTexto = "No iniciada";
                }

                response.Add(new
                {
                    idEleccion = e.IdEleccion,
                    tituloEleccion = e.TituloEleccion,
                    electionIdOnChain = e.ElectionIdOnChain,
                    estado = estadoTexto,
                    candidatos = e.ElectionCandidates.Select(ec => new {
                        id = ec.Candidate.IdCandidato,
                        nombre = ec.Candidate.Nombres + " " + ec.Candidate.Apellidos
                    }).ToList()
                });
            }

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetElection(int id)
        {
            var election = await _context.Elections
                .Where(e => e.IdEleccion == id)
                .Include(e => e.ElectionCandidates)
                    .ThenInclude(ec => ec.Candidate)
                .FirstOrDefaultAsync();

            if (election == null)
                return ApiError.NotFound("Elección no encontrada.");

            // Consultar estado en blockchain → usar dynamic
            dynamic status = await _blockchain.GetElectionStatusAsync(election.ElectionIdOnChain);

            string estadoTexto;
            if (status == null)
            {
                estadoTexto = "Desconocido";
            }
            else
            {
                bool started = status.Started;
                bool ended = status.Ended;

                if (ended)
                    estadoTexto = "Finalizada";
                else if (started)
                    estadoTexto = "Activo";
                else
                    estadoTexto = "No iniciada";
            }

            return Ok(new
            {
                idEleccion = election.IdEleccion,
                tituloEleccion = election.TituloEleccion,
                electionIdOnChain = election.ElectionIdOnChain,
                estado = estadoTexto,
                candidatos = election.ElectionCandidates.Select(ec => new
                {
                    id = ec.Candidate.IdCandidato,
                    nombre = ec.Candidate.Nombres + " " + ec.Candidate.Apellidos,
                    candidateIndex = ec.CandidateIndex
                }).ToList()
            });
        }


        [HttpGet("finalizadas")]
        [AllowAnonymous] // Permitir acceso público
        public async Task<IActionResult> GetFinalizedElections()
        {
            var list = await _context.Elections
                .Where(e => e.Terminada)
                .Include(e => e.ElectionCandidates)
                    .ThenInclude(ec => ec.Candidate)
                .Select(e => new
                {
                    idEleccion = e.IdEleccion,
                    tituloEleccion = e.TituloEleccion,
                    electionIdOnChain = e.ElectionIdOnChain,
                    candidatos = e.ElectionCandidates.Select(ec => new {
                        id = ec.Candidate.IdCandidato,
                        nombre = ec.Candidate.Nombres + " " + ec.Candidate.Apellidos
                    }).ToList()
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("{id}/candidates")]
        public async Task<IActionResult> GetCandidates(int id)
        {
            var candidates = await _context.ElectionCandidates
                .Where(ec => ec.IdEleccion == id)
                .Include(ec => ec.Candidate)
                .OrderBy(ec => ec.CandidateIndex)
                .Select(ec => new
                {
                    ec.IdCandidato,
                    ec.Candidate.Nombres,
                    ec.Candidate.Apellidos,
                    ec.CandidateIndex
                })
                .ToListAsync();

            return Ok(candidates);
        }

        [HttpGet("{id}/signatures")]
        [AllowAnonymous]
        public async Task<IActionResult> GetSignatures(uint id)
        {
            var signatures = await _context.ElectionSignatures
                .Where(s => s.ElectionIdOnChain == id)
                .OrderBy(s => s.FechaFirma)
                .Select(s => new
                {
                    s.ObserverName,
                    s.ObserverPublicKey,
                    s.ObserverSignature,
                    s.IntegrityHash,
                    s.FechaFirma
                })
                .ToListAsync();

            return Ok(signatures);
        }

        [HttpPost("{id}/sign-result")]
        [AllowAnonymous]
        public async Task<IActionResult> SignResult(uint id, [FromBody] SignResultRequest request)
        {
            // Paso 1: Validar parámetros básicos
            if (string.IsNullOrEmpty(request.IntegrityHash) ||
                string.IsNullOrEmpty(request.ObserverPublicKey) ||
                string.IsNullOrEmpty(request.ObserverSignature))
            {
                return ApiError.BadRequest("Faltan datos obligatorios.");
            }

            // Paso 2: Validar que no se haya firmado ya por esta clave + hash
            bool exists = await _context.ElectionSignatures.AnyAsync(s =>
                s.ElectionIdOnChain == id &&
                s.IntegrityHash == request.IntegrityHash &&
                s.ObserverPublicKey == request.ObserverPublicKey
            );

            if (exists)
            {
                return ApiError.Conflict("Este observador ya ha firmado este resultado.");
            }

            // Paso 3: Verificar que la firma sea válida (usamos Nethereum.Signer)
            try
            {
                var signer = new Nethereum.Signer.EthereumMessageSigner();

                // La firma de Metamask es personal_sign → hay que hacer el recover sobre el mensaje completo (hash)
                string recoveredAddress = signer.EncodeUTF8AndEcRecover($"Hash de integridad: {request.IntegrityHash}", request.ObserverSignature);

                if (!string.Equals(recoveredAddress, request.ObserverPublicKey, StringComparison.OrdinalIgnoreCase))
                {
                    return ApiError.BadRequest($"Firma no válida. La firma corresponde a {recoveredAddress}, pero se esperaba {request.ObserverPublicKey}");
                }
            }
            catch (Exception ex)
            {
                return ApiError.BadRequest($"Error al validar firma: {ex.Message}");
            }

            // Paso 4: Si la firma es válida → Registrar firma
            var signature = new ElectionSignature
            {
                ElectionIdOnChain = id,
                IntegrityHash = request.IntegrityHash,
                ObserverName = request.ObserverName,
                ObserverPublicKey = request.ObserverPublicKey,
                ObserverSignature = request.ObserverSignature,
                FechaFirma = DateTime.UtcNow
            };

            _context.ElectionSignatures.Add(signature);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Firma registrada correctamente." });
        }

    }

    // Request para iniciar elección
    public class StartElectionRequest
    {
        public string Title { get; set; }
        public List<int> CandidateIds { get; set; }
    }

    // Request para firmar resultados
    public class SignResultRequest
    {
        public string IntegrityHash { get; set; } = null!;
        public string ObserverName { get; set; } = null!;
        public string ObserverPublicKey { get; set; } = null!;
        public string ObserverSignature { get; set; } = null!;
    }

}