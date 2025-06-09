using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Helpers
{
    public class JwtTokenHelper
    {
        private readonly string _secretKey;

        public JwtTokenHelper(IConfiguration configuration)
        {
            _secretKey = configuration["Jwt:SecretKey"];
        }

        public string GenerateJwtToken(Voter voter)
        {
            var key = Encoding.ASCII.GetBytes(_secretKey);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, voter.Wallet),
                    new Claim(ClaimTypes.Name, voter.Nombres + " " + voter.Apellidos),
                    new Claim(ClaimTypes.Role, voter.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}


//using backend.Models;
//using Microsoft.IdentityModel.Tokens;
//using System.IdentityModel.Tokens.Jwt;
//using System.Security.Claims;
//using System.Text;

//namespace backend.Helpers
//{
//    public static class JwtTokenHelper
//    {
//        // ⚠️ Esta clave debe ser igual a la que configures en tu appsettings.json o Startup.
//        private static readonly string SecretKey = "1dbd68a562bead2cd74f84363182cfc37dbff5aec9c7853773a12e92674c66e3";

//        public static string GenerateJwtToken(Voter voter)
//        {
//            var key = Encoding.ASCII.GetBytes(SecretKey);

//            var tokenHandler = new JwtSecurityTokenHandler();
//            var tokenDescriptor = new SecurityTokenDescriptor
//            {
//                Subject = new ClaimsIdentity(new[]
//                {
//                    new Claim(ClaimTypes.NameIdentifier, voter.Wallet),
//                    new Claim(ClaimTypes.Name, voter.Nombres + " " + voter.Apellidos),
//                    new Claim(ClaimTypes.Role, voter.Role)
//                }),
//                Expires = DateTime.UtcNow.AddHours(2), // Puedes cambiar la expiración
//                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
//            };

//            var token = tokenHandler.CreateToken(tokenDescriptor);
//            return tokenHandler.WriteToken(token);
//        }
//    }
//}
