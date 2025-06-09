using System.Numerics;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Contracts;
using Nethereum.ABI.FunctionEncoding.Attributes;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Security.Cryptography;

namespace backend.Services
{
    public class BlockchainService
    {
        private readonly Web3 web3;
        private readonly Contract contract;

        public BlockchainService(IConfiguration configuration)
        {
            var abiPath = Path.Combine(Directory.GetCurrentDirectory(), "Contracts", "Election.abi.json");
            var abi = File.ReadAllText(abiPath);

            var account = new Account(configuration["Blockchain:PrivateKey"]);
            var rpcUrl = configuration["Blockchain:RpcUrl"];
            var contractAddress = configuration["Blockchain:ContractAddress"];

            web3 = new Web3(account, rpcUrl);
            contract = web3.Eth.GetContract(abi, contractAddress);
        }

        public async Task<uint> StartElectionAsync(string title, List<string> candidates)
        {
            try
            {
                Console.WriteLine($"[Blockchain] Llamando a startNewElection con título: {title}");
                Console.WriteLine($"[Blockchain] Candidatos: {string.Join(", ", candidates)}");
                Console.WriteLine("Backend usando cuenta: " + web3.TransactionManager.Account.Address);
                var startFunction = contract.GetFunction("startNewElection");
                var receipt = await startFunction.SendTransactionAndWaitForReceiptAsync(
                    web3.TransactionManager.Account.Address,
                    new Nethereum.Hex.HexTypes.HexBigInteger(900000),
                    null, null, title, candidates.ToArray()
                );

                var logs = receipt.DecodeAllEvents<ElectionStartedEventDTO>();
                if (logs.Count > 0)
                {
                    var electionId = logs[0].Event.ElectionId;
                    Console.WriteLine($"Evento ElectionStarted encontrado. ID: {electionId}");
                    return electionId;
                }
                else
                {
                    Console.WriteLine("No se encontró el evento ElectionStarted.");
                    return 0;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("[Blockchain] Excepción: " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("[Blockchain] Inner: " + ex.InnerException.Message);
                return 0;
            }
        }

        public async Task<string> SendVoteAsync(uint electionId, string walletAddress, string candidateName)
        {
            try
            {
                var getCandidatesCount = contract.GetFunction("getCandidatesCount");
                var total = await getCandidatesCount.CallAsync<BigInteger>(electionId);

                var getCandidate = contract.GetFunction("getCandidate");
                int candidateIndex = -1;

                for (int i = 0; i < (int)total; i++)
                {
                    var result = await getCandidate.CallDeserializingToObjectAsync<Candidate>(electionId, i);
                    if (result.Name.Equals(candidateName, StringComparison.OrdinalIgnoreCase))
                    {
                        candidateIndex = i;
                        break;
                    }
                }

                if (candidateIndex == -1)
                {
                    Console.WriteLine("Candidato no encontrado");
                    return "candidate_not_found";
                }

                var voteFunc = contract.GetFunction("vote");
                var receipt = await voteFunc.SendTransactionAndWaitForReceiptAsync(
                    web3.TransactionManager.Account.Address,
                    new Nethereum.Hex.HexTypes.HexBigInteger(900000),
                    null, null, electionId, candidateIndex
                );

                return receipt.Status.Value == 1 ? "success" : "contract_rejected";
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error votando: " + ex.Message);
                return "error";
            }
        }

        public async Task<string> VoteForAsync(uint electionId, string walletAddress, int candidateIndex)
        {
            try
            {
                Console.WriteLine($"[Blockchain] Enviando voto: ElectionId = {electionId}, CandidateIndex = {candidateIndex}, Wallet = {walletAddress}");

                var voteFunc = contract.GetFunction("voteFor");
                var receipt = await voteFunc.SendTransactionAndWaitForReceiptAsync(
                    web3.TransactionManager.Account.Address,
                    new Nethereum.Hex.HexTypes.HexBigInteger(900000),
                    null, null, electionId, candidateIndex, walletAddress
                );

                Console.WriteLine($"[Blockchain] Voto enviado. Tx Status: {receipt.Status.Value}");

                return receipt.Status.Value == 1 ? "success" : "contract_rejected";
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al emitir voto con voteFor: " + ex.Message);
                return "error";
            }
        }

        public async Task<List<ResultEntry>> GetResultsAsync(uint electionId)
        {
            try
            {
                var getResults = contract.GetFunction("getResults");
                var result = await getResults.CallDeserializingToObjectAsync<GetResultsOutput>(electionId);

                return result.Names.Zip(result.Votes, (name, votes) => new ResultEntry
                {
                    CandidateName = name,
                    Votes = (int)votes
                }).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error obteniendo resultados: " + ex.Message);
                return new List<ResultEntry>();
            }
        }

        public async Task<object> GetResultsWithIntegrityAsync(uint electionId)
        {
            var getResults = contract.GetFunction("getResults");
            var result = await getResults.CallDeserializingToObjectAsync<GetResultsOutput>(electionId);

            // Construir cadena para hash
            var sb = new StringBuilder();
            for (int i = 0; i < result.Names.Count; i++)
            {
                sb.Append(result.Names[i]).Append(":").Append(result.Votes[i]).Append(";");
            }

            // Calcular hash SHA-256
            using var sha256 = SHA256.Create();
            var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(sb.ToString()));
            var hashHex = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();

            // Devolver resultados + hash
            return new
            {
                Results = result.Names.Zip(result.Votes, (name, votes) => new ResultEntry
                {
                    CandidateName = name,
                    Votes = (int)votes
                }).ToList(),
                IntegrityHash = hashHex
            };
        }

        public async Task<object> GetElectionStatusAsync(uint electionId)
        {
            try
            {
                var getStatus = contract.GetFunction("getElectionStatus");
                var result = await getStatus.CallDeserializingToObjectAsync<ElectionStatusOutput>(electionId);
                Console.WriteLine($"Estado elección {electionId}:");
                Console.WriteLine($"- Título: {result.Title}");
                Console.WriteLine($"- Iniciada: {result.Started}");
                Console.WriteLine($"- Finalizada: {result.Ended}");
                Console.WriteLine($"- Candidatos: {result.CandidatesCount}");

                return new
                {
                    Title = result.Title,
                    Started = result.Started,
                    Ended = result.Ended,
                    CandidatesCount = (int)result.CandidatesCount
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error al obtener estado de elección: " + ex.Message);
                return null;
            }
        }

        public async Task<bool> HasAddressVotedAsync(uint electionId, string address)
        {
            try
            {
                // Normalize wallet address to lowercase for consistency
                var normalizedAddress = address.ToLowerInvariant();

                Console.WriteLine($"[Blockchain] Verificando hasVoted para {normalizedAddress} en elección {electionId}");

                var hasVoted = contract.GetFunction("hasAddressVoted");
                var result = await hasVoted.CallAsync<bool>(electionId, normalizedAddress);

                Console.WriteLine($"[Blockchain] Resultado hasVoted desde blockchain: {result}");

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al verificar si votó: {ex.Message}");
                return false;
            }
        }


        public async Task<bool> EndElectionAsync(uint electionId)
        {
            try
            {
                var endFunc = contract.GetFunction("endElection");
                var receipt = await endFunc.SendTransactionAndWaitForReceiptAsync(
                web3.TransactionManager.Account.Address,
                new Nethereum.Hex.HexTypes.HexBigInteger(900000),
                null,
                null,
                electionId
                );
                Console.WriteLine($"Elección {electionId} finalizada. Status: {receipt.Status.Value}");
                return receipt.Status.Value == 1;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al finalizar la elección {electionId}: {ex.Message}");
                return false;
            }
        }

        public async Task<object> GetWinnerAsync(uint electionId)
        {
            try
            {
                // Validar que la elección haya terminado
                var statusFunc = contract.GetFunction("getElectionStatus");
                var status = await statusFunc.CallDeserializingToObjectAsync<ElectionStatusOutput>(electionId);
                if (!status.Ended)
                {
                    Console.WriteLine($"[Blockchain] La elección {electionId} aún no ha finalizado.");
                    return null; // Se manejará como BadRequest en el controlador
                }

                var func = contract.GetFunction("getWinner");
                var result = await func.CallDeserializingToObjectAsync<GetWinnerOutput>(electionId);

                if (result.IsTie)
                {
                    return new
                    {
                        Winner = (string?)null,
                        Votes = 0,
                        IsTie = true,
                        Message = "Empate entre candidatos. No hay un ganador claro."
                    };
                }

                // Aquí el fix importante 👇
                if (string.IsNullOrWhiteSpace(result.WinnerName))
                {
                    return new
                    {
                        Winner = (string?)null,
                        Votes = (int)result.WinnerVotes,
                        IsTie = false,
                        Message = "No hay votos registrados."
                    };
                }

                return new
                {
                    Winner = result.WinnerName,
                    Votes = (int)result.WinnerVotes,
                    IsTie = false,
                    Message = $"El ganador es {result.WinnerName} con {result.WinnerVotes} votos."
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al obtener el ganador: {ex.Message}");
                return null;
            }
        }


        [FunctionOutput]
        public class Candidate : IFunctionOutputDTO
        {
            [Parameter("string", "name", 1)]
            public string Name { get; set; }

            [Parameter("uint256", "voteCount", 2)]
            public BigInteger VoteCount { get; set; }
        }

        [Event("ElectionStarted")]
        public class ElectionStartedEventDTO : IEventDTO
        {
            [Parameter("uint256", "electionId", 1, false)]
            public uint ElectionId { get; set; }
            [Parameter("string", "title", 2, false)]
            public string Title { get; set; }
        }

        public class ResultEntry
        {
            public string CandidateName { get; set; }
            public int Votes { get; set; }
        }

        [FunctionOutput]
        public class GetResultsOutput : IFunctionOutputDTO
        {
            [Parameter("string[]", "names", 1)]
            public List<string> Names { get; set; }

            [Parameter("uint256[]", "votes", 2)]
            public List<BigInteger> Votes { get; set; }
        }

        [FunctionOutput]
        public class ElectionStatusOutput : IFunctionOutputDTO
        {
            [Parameter("string", "title", 1)]
            public string Title { get; set; }
            [Parameter("bool", "started", 2)]
            public bool Started { get; set; }

            [Parameter("bool", "ended", 3)]
            public bool Ended { get; set; }

            [Parameter("uint256", "candidatesCount", 4)]
            public BigInteger CandidatesCount { get; set; }
        }

        [FunctionOutput]
        public class GetWinnerOutput : IFunctionOutputDTO
        {
            [Parameter("string", "winnerName", 1)]
            public string WinnerName { get; set; }
            [Parameter("uint256", "winnerVotes", 2)]
            public BigInteger WinnerVotes { get; set; }

            [Parameter("bool", "isTie", 3)]
            public bool IsTie { get; set; }
        }
    }
}


