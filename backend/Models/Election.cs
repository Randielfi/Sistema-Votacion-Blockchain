using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Election
    {
        [Key]
        public int IdEleccion { get; set; }

        [Required]
        [MaxLength(200)]
        public string TituloEleccion { get; set; }

        [Required]
        public uint ElectionIdOnChain { get; set; }
        public bool Iniciada { get; set; } = false;
        public bool Terminada { get; set; } = false;

        // Relaciones
        public ICollection<Vote> Votes { get; set; }
        public ICollection<ElectionCandidate> ElectionCandidates { get; set; }
    }
}
