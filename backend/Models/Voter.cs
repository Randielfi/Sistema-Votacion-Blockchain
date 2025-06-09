using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Voter
    {
        [Key]
        public int IdVotante { get; set; }

        [Required]
        [MaxLength(20)]
        public string NumeroCedula { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombres { get; set; }

        [Required]
        [MaxLength(100)]
        public string Apellidos { get; set; }

        [Required]
        [MaxLength(100)]
        public string Wallet { get; set; }

        [Required]
        public string Contraseña { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "Voter";

        [MaxLength(100)]
        public string? Nonce { get; set; }
    }
}
