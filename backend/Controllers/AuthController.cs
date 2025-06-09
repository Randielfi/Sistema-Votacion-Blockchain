using backend.Data;
using backend.Helpers;
using backend.Models;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtTokenHelper _jwtTokenHelper;
        public AuthController(ApplicationDbContext context, JwtTokenHelper jwtTokenHelper)
        {
            _context = context;
            _jwtTokenHelper = jwtTokenHelper;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Validar campos requeridos
            if (string.IsNullOrEmpty(request.NumeroCedula) ||
                string.IsNullOrEmpty(request.Nombres) ||
                string.IsNullOrEmpty(request.Apellidos) ||
                string.IsNullOrEmpty(request.Wallet) ||
                string.IsNullOrEmpty(request.Contraseña))
            {
                return BadRequest("Faltan datos obligatorios.");
            }

            // Validar cédula dominicana
            if (!CedulaEsValida(request.NumeroCedula))
                return ApiError.BadRequest("Número de cédula inválido. Solo se permiten cédulas dominicanas válidas.");

            // Verificar que la wallet no esté ya registrada
            bool walletExists = await _context.Voters.AnyAsync(v => v.Wallet == request.Wallet);
            if (walletExists)
                return ApiError.BadRequest("Esta wallet ya está registrada.");

            // Verificar que la cédula no esté ya registrada
            bool cedulaExists = await _context.Voters.AnyAsync(v => v.NumeroCedula == request.NumeroCedula);
            if (cedulaExists)
                return ApiError.BadRequest("Este número de cédula ya está registrado.");

            // Crear el nuevo votante
            var voter = new Voter
            {
                NumeroCedula = request.NumeroCedula,
                Nombres = request.Nombres,
                Apellidos = request.Apellidos,
                Wallet = request.Wallet,
                Contraseña = request.Contraseña,
                Role = "Voter"
            };

            _context.Voters.Add(voter);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registro exitoso." });
        }

        [HttpGet("nonce")]
        public async Task<IActionResult> GetNonce([FromQuery] string wallet)
        {
            if (string.IsNullOrEmpty(wallet))
                return ApiError.BadRequest("Wallet requerida.");

            var voter = await _context.Voters.FirstOrDefaultAsync(v => v.Wallet == wallet);
            if (voter == null)
                return ApiError.NotFound("Wallet no registrada.");

            // Generar nonce aleatorio
            var nonce = Guid.NewGuid().ToString();

            // Guardarlo en BD
            voter.Nonce = nonce;
            await _context.SaveChangesAsync();

            return Ok(new { wallet = wallet, nonce = nonce });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Validar campos
            if (string.IsNullOrEmpty(request.Wallet) || string.IsNullOrEmpty(request.Contraseña))
                return ApiError.BadRequest("Faltan datos.");

            // Buscar el voter
            var voter = await _context.Voters.FirstOrDefaultAsync(v => v.Wallet == request.Wallet);
            if (voter == null)
                return ApiError.Unauthorized("Wallet no registrada.");

            // Validar contraseña (esto es ejemplo simple, luego puedes hashear)
            if (voter.Contraseña != request.Contraseña)
                return ApiError.Unauthorized("Wallet y/o contraseña incorrecta.");

            // Emitir JWT
            var token = _jwtTokenHelper.GenerateJwtToken(voter);
            return Ok(new { token });
        }

        [HttpPost("login-with-signature")]
        public async Task<IActionResult> LoginWithSignature([FromBody] LoginWithSignatureRequest request)
        {
            // Validar campos
            if (string.IsNullOrEmpty(request.Wallet) || string.IsNullOrEmpty(request.Signature) || string.IsNullOrEmpty(request.Nonce))
                return ApiError.BadRequest("Faltan datos.");

            // Buscar el voter
            var voter = await _context.Voters.FirstOrDefaultAsync(v => v.Wallet == request.Wallet);
            if (voter == null)
                return ApiError.Unauthorized("Wallet no registrada.");

            // Validar que el nonce coincida
            if (voter.Nonce != request.Nonce)
                return ApiError.Unauthorized("Nonce inválido.");

            // Validar la firma
            bool valid = SignatureHelper.VerifySignature(request.Wallet, request.Signature, request.Nonce);
            if (!valid)
                return ApiError.Unauthorized("Firma inválida.");

            // Opcional: limpiar el nonce para evitar reuse
            voter.Nonce = null;
            await _context.SaveChangesAsync();

            // Emitir JWT
            var token = _jwtTokenHelper.GenerateJwtToken(voter);
            return Ok(new { token });
        }

        // Validador de cédula dominicana
        public static bool CedulaEsValida(string cedula)
        {
            // Quitar guiones si los tiene
            cedula = cedula.Replace("-", "").Trim();

            if (cedula.Length != 11 || !cedula.All(char.IsDigit))
                return false;

            int suma = 0;
            int[] multiplicadores = { 1, 2 };

            for (int i = 0; i < 10; i++)
            {
                int digito = int.Parse(cedula[i].ToString());
                int mult = digito * multiplicadores[i % 2];

                if (mult > 9)
                    mult = (mult / 10) + (mult % 10);

                suma += mult;
            }

            int ultimoDigito = int.Parse(cedula[10].ToString());
            int verificadorEsperado = (10 - (suma % 10)) % 10;

            return ultimoDigito == verificadorEsperado;
        }

    }

    // Modelo de request para registro
    public class RegisterRequest
    {
        public string NumeroCedula { get; set; }
        public string Nombres { get; set; }
        public string Apellidos { get; set; }
        public string Wallet { get; set; } // 🚀 corresponde al campo Wallet de VOTANTE
        public string Contraseña { get; set; }
    }

    public class LoginRequest
    {
        public string Wallet { get; set; }
        public string Contraseña { get; set; }
    }

    public class LoginWithSignatureRequest
    {
        public string Wallet { get; set; }
        public string Signature { get; set; }
        public string Nonce { get; set; }
    }

}